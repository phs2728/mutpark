import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Verify the request is from a cron job (you might want to add authentication)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting expiry notification cron job...");

    // Get all users with expiry notifications enabled
    const usersWithPreferences = await prisma.user.findMany({
      include: {
        preferences: true,
        orders: {
          where: {
            status: "DELIVERED",
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50, // Recent orders only
        },
      },
    });

    let notificationsCreated = 0;

    for (const user of usersWithPreferences) {
      const preferences = user.preferences;

      // Skip if user has disabled expiry notifications
      if (preferences && !preferences.expiryNotifications) {
        continue;
      }

      const daysBefore = preferences?.notificationDaysBefore || 3;
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + daysBefore);

      // Find products from user's orders that are expiring soon
      const expiringProducts = new Map<number, unknown>();

      for (const order of user.orders) {
        for (const item of order.items) {
          const product = item.product;

          if (!product.expiryDate) continue;

          const expiryDate = new Date(product.expiryDate);
          const now = new Date();

          // Check if product expires within warning period
          if (expiryDate > now && expiryDate <= warningDate) {
            if (!expiringProducts.has(product.id)) {
              expiringProducts.set(product.id, {
                ...product,
                quantity: item.quantity,
                orderDate: order.createdAt,
              });
            }
          }
        }
      }

      // Create notifications for expiring products
      for (const [productId, product] of expiringProducts) {
        // Check if notification already exists
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            type: "EXPIRY_WARNING",
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        });

        // Check if this productId already has a notification
        if (existingNotification) {
          const notificationData = existingNotification.data as Record<string, unknown>;
          if (notificationData?.productId === productId) {
            continue;
          }
        }


        const productData = product as Record<string, unknown>;
        const daysUntilExpiry = Math.ceil(
          (new Date(productData.expiryDate as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        await prisma.notification.create({
          data: {
            userId: user.id,
            type: "EXPIRY_WARNING",
            title: "유통기한 임박 알림",
            message: `구매하신 ${productData.baseName}의 유통기한이 ${daysUntilExpiry}일 남았습니다.`,
            data: {
              productId: productData.id as number,
              productName: productData.baseName as string,
              expiryDate: productData.expiryDate as string,
              daysUntilExpiry,
              quantity: productData.quantity as number,
            },
          },
        });

        notificationsCreated++;
      }

      // Also check for new products that are expiring soon (general inventory)
      const expiringInventory = await prisma.product.findMany({
        where: {
          expiryDate: {
            lte: warningDate,
            gt: new Date(),
          },
          stock: { gt: 0 },
          freshnessStatus: { not: "EXPIRED" },
        },
        include: {
          translations: true,
        },
        take: 10,
      });

      // Create general expiry warnings for products in categories user has purchased
      const userCategories = new Set(
        user.orders.flatMap(order =>
          order.items
            .filter(item => item.product.category)
            .map(item => item.product.category!)
        )
      );

      for (const product of expiringInventory) {
        if (!userCategories.has(product.category || "")) continue;

        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            type: "EXPIRY_WARNING",
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        });

        // Check if this productId already has a notification
        if (existingNotification) {
          const notificationData = existingNotification.data as Record<string, unknown>;
          if (notificationData?.productId === product.id) {
            continue;
          }
        }


        const daysUntilExpiry = Math.ceil(
          (new Date(product.expiryDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        await prisma.notification.create({
          data: {
            userId: user.id,
            type: "EXPIRY_WARNING",
            title: "할인 상품 알림",
            message: `관심 카테고리의 ${product.baseName}이 ${daysUntilExpiry}일 후 유통기한이 만료되어 할인 중입니다.`,
            data: {
              productId: product.id,
              productName: product.baseName,
              expiryDate: product.expiryDate,
              daysUntilExpiry,
              isGeneralInventory: true,
            },
          },
        });

        notificationsCreated++;
      }
    }

    // Clean up old notifications (older than 30 days)
    await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    console.log(`Expiry notification cron completed. Created ${notificationsCreated} notifications.`);

    return NextResponse.json({
      success: true,
      notificationsCreated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in expiry notification cron:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}