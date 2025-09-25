import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const activityFilter = searchParams.get("activityFilter");

    const skip = (page - 1) * limit;

    const where: any = {};

    // Exclude admin users from customer list
    if (role && role !== "ALL") {
      where.role = role;
    } else {
      where.role = "CUSTOMER";
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    // Activity filter
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (activityFilter) {
      switch (activityFilter) {
        case "ACTIVE_WEEK":
          where.orders = { some: { createdAt: { gte: sevenDaysAgo } } };
          break;
        case "ACTIVE_MONTH":
          where.orders = { some: { createdAt: { gte: thirtyDaysAgo } } };
          break;
        case "INACTIVE":
          where.orders = { none: { createdAt: { gte: thirtyDaysAgo } } };
          break;
      }
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          socialAccounts: true,
          orders: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true
            },
            orderBy: { createdAt: "desc" },
            take: 5
          },
          communityPosts: {
            select: { id: true, createdAt: true },
            take: 1
          },
          _count: {
            select: {
              orders: true,
              communityPosts: true,
              productReviews: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    const customersWithStats = customers.map(customer => {
      const totalSpent = customer.orders.reduce((sum, order) =>
        sum + parseFloat(order.totalAmount.toString()), 0
      );
      const lastOrderDate = customer.orders[0]?.createdAt;
      const lastActivity = customer.communityPosts[0]?.createdAt || lastOrderDate;

      return {
        ...customer,
        totalSpent,
        lastOrderDate,
        lastActivity,
        orderCount: customer._count.orders,
        postCount: customer._count.communityPosts,
        reviewCount: customer._count.productReviews,
        activityStatus: lastActivity && new Date(lastActivity) > sevenDaysAgo
          ? "ACTIVE" : "INACTIVE",
        socialLoginTypes: customer.socialAccounts.map(acc => acc.provider)
      };
    });

    return NextResponse.json({
      customers: customersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Admin customers fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, action, ...updateData } = await request.json();

    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updatedUser;

    switch (action) {
      case "UPDATE_ROLE":
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { role: updateData.role }
        });
        break;

      case "UPDATE_STATUS":
        // For user activation/deactivation, we can use a custom field
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: updateData
        });
        break;

      default:
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: updateData
        });
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "UPDATE",
        entityType: "User",
        entityId: userId.toString(),
        oldValues: currentUser,
        newValues: updateData,
        description: `Customer ${action || "updated"}: ${currentUser.email}`
      }
    });

    return NextResponse.json({ user: updatedUser });

  } catch (error) {
    console.error("Admin customer update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}