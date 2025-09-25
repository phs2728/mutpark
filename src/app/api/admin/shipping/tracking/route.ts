import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { shippingService } from "@/lib/shipping-service";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const providerId = searchParams.get("providerId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (status) where.status = status;
    if (providerId) where.providerId = parseInt(providerId);

    const [trackings, total] = await Promise.all([
      prisma.shippingTracking.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              user: {
                select: {
                  name: true,
                  email: true,
                }
              }
            }
          },
          provider: {
            select: {
              id: true,
              name: true,
              code: true,
              logo: true,
            }
          }
        },
        orderBy: { lastSyncAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.shippingTracking.count({ where }),
    ]);

    return NextResponse.json({
      trackings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Shipping tracking fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, providerId, trackingNumber } = await request.json();

    if (!orderId || !providerId || !trackingNumber) {
      return NextResponse.json(
        { error: "Order ID, provider ID, and tracking number are required" },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if provider exists
    const provider = await prisma.shippingProvider.findUnique({
      where: { id: parseInt(providerId) }
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // Check if tracking already exists for this order
    const existingTracking = await prisma.shippingTracking.findUnique({
      where: { orderId: parseInt(orderId) }
    });

    if (existingTracking) {
      return NextResponse.json(
        { error: "Tracking already exists for this order" },
        { status: 400 }
      );
    }

    // Create tracking record
    const tracking = await prisma.shippingTracking.create({
      data: {
        orderId: parseInt(orderId),
        providerId: parseInt(providerId),
        trackingNumber,
        status: "PENDING",
        events: [],
        lastSyncAt: new Date(),
      },
    });

    // Try to get initial tracking information
    try {
      const trackingInfo = await shippingService.trackPackage(trackingNumber, parseInt(providerId));
      if (trackingInfo) {
        await shippingService.updateShippingTracking(parseInt(orderId), trackingInfo);
      }
    } catch (error) {
      console.error("Initial tracking fetch failed:", error);
      // Continue without failing the creation
    }

    // Update order status
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        status: "SHIPPED",
        trackingNumber
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "CREATE",
        entityType: "ShippingTracking",
        entityId: tracking.id.toString(),
        oldValues: {},
        newValues: { orderId, trackingNumber, providerId },
        description: `Created shipping tracking for order ${order.orderNumber}: ${trackingNumber}`,
      },
    });

    return NextResponse.json({ success: true, tracking });

  } catch (error) {
    console.error("Shipping tracking creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}