import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(params.id);

    const customer = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        socialAccounts: true,
        addresses: true,
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: { baseName: true, imageUrl: true }
                }
              }
            },
            payment: true
          },
          orderBy: { createdAt: "desc" }
        },
        communityPosts: {
          include: {
            likes: true,
            comments: true
          },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        productReviews: {
          include: {
            product: {
              select: { baseName: true, imageUrl: true }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        preferences: true,
        badges: true,
        _count: {
          select: {
            orders: true,
            communityPosts: true,
            productReviews: true,
            followers: true,
            following: true
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const customerStats = {
      totalSpent: customer.orders.reduce((sum, order) =>
        sum + parseFloat(order.totalAmount.toString()), 0
      ),
      averageOrderValue: customer.orders.length > 0
        ? customer.orders.reduce((sum, order) =>
            sum + parseFloat(order.totalAmount.toString()), 0
          ) / customer.orders.length
        : 0,
      lastOrderDate: customer.orders[0]?.createdAt,
      orderStatusCounts: customer.orders.reduce((counts, order) => {
        counts[order.status] = (counts[order.status] || 0) + 1;
        return counts;
      }, {} as Record<string, number>),
      communityEngagement: {
        postsCount: customer._count.communityPosts,
        totalLikes: customer.communityPosts.reduce((sum, post) =>
          sum + post.likes.length, 0
        ),
        totalComments: customer.communityPosts.reduce((sum, post) =>
          sum + post.comments.length, 0
        )
      },
      reviewStats: {
        count: customer._count.productReviews,
        averageRating: customer.productReviews.length > 0
          ? customer.productReviews.reduce((sum, review) =>
              sum + review.rating, 0
            ) / customer.productReviews.length
          : 0
      },
      socialConnections: customer.socialAccounts.map(acc => acc.provider),
      activityTimeline: [
        ...customer.orders.map(order => ({
          type: "ORDER",
          date: order.createdAt,
          description: `Order #${order.orderNumber} - ${order.status}`,
          amount: order.totalAmount
        })),
        ...customer.communityPosts.map(post => ({
          type: "POST",
          date: post.createdAt,
          description: `Posted: ${post.title.substring(0, 50)}...`,
          likes: post.likes.length
        })),
        ...customer.productReviews.map(review => ({
          type: "REVIEW",
          date: review.createdAt,
          description: `Reviewed: ${review.product.baseName}`,
          rating: review.rating
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20)
    };

    return NextResponse.json({
      customer: {
        ...customer,
        stats: customerStats
      }
    });

  } catch (error) {
    console.error("Admin customer detail fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(params.id);
    const updateData = await request.json();

    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const updatedCustomer = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "UPDATE",
        entityType: "User",
        entityId: userId.toString(),
        oldValues: currentUser,
        newValues: updateData,
        description: `Customer updated: ${currentUser.email}`
      }
    });

    return NextResponse.json({ customer: updatedCustomer });

  } catch (error) {
    console.error("Admin customer update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(params.id);

    const customer = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Check if customer has orders
    const orderCount = await prisma.order.count({
      where: { userId }
    });

    if (orderCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete customer with existing orders. Consider deactivating instead." },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "DELETE",
        entityType: "User",
        entityId: userId.toString(),
        oldValues: customer,
        description: `Customer deleted: ${customer.email}`
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Admin customer delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}