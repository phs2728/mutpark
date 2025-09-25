import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get real-time notifications from database events
    const [
      newOrders,
      lowStockProducts,
      newUsers,
      failedPayments,
      recentReviews
    ] = await Promise.all([
      // New orders in last 24 hours
      prisma.order.findMany({
        where: {
          createdAt: { gte: oneDayAgo }
        },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: {
              product: { select: { baseName: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Low stock products (less than 10 units)
      prisma.product.findMany({
        where: {
          stock: { lt: 10 }
        },
        select: {
          id: true,
          baseName: true,
          stock: true,
          category: true
        },
        orderBy: { stock: 'asc' },
        take: 5
      }),

      // New users in last week
      prisma.user.findMany({
        where: {
          createdAt: { gte: oneWeekAgo }
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // Failed payments in last 24 hours
      prisma.payment.findMany({
        where: {
          status: 'FAILED',
          createdAt: { gte: oneDayAgo }
        },
        include: {
          order: {
            include: {
              user: { select: { name: true, email: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // Recent reviews (last 24 hours)
      prisma.productReview.findMany({
        where: {
          createdAt: { gte: oneDayAgo }
        },
        include: {
          user: { select: { name: true } },
          product: { select: { baseName: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Build notifications array
    const notifications = [];

    // New orders notifications
    newOrders.forEach(order => {
      notifications.push({
        id: `order-${order.id}`,
        type: 'order',
        title: '새로운 주문',
        message: `${order.user.name}님이 주문을 완료했습니다`,
        time: order.createdAt,
        priority: 'normal',
        link: `/admin/orders/${order.id}`,
        data: {
          orderId: order.id,
          customerName: order.user.name,
          itemCount: order.items.length
        }
      });
    });

    // Low stock alerts
    lowStockProducts.forEach(product => {
      notifications.push({
        id: `stock-${product.id}`,
        type: 'warning',
        title: '재고 부족 알림',
        message: `${product.baseName} 재고가 ${product.stock}개 남았습니다`,
        time: now, // Current time as this is a real-time check
        priority: 'high',
        link: `/admin/products/${product.id}`,
        data: {
          productId: product.id,
          productName: product.baseName,
          currentStock: product.stock
        }
      });
    });

    // New user registrations
    newUsers.forEach(user => {
      notifications.push({
        id: `user-${user.id}`,
        type: 'info',
        title: '새 회원 가입',
        message: `${user.name}님이 회원가입했습니다`,
        time: user.createdAt,
        priority: 'low',
        link: `/admin/users`,
        data: {
          userId: user.id,
          userName: user.name,
          userEmail: user.email
        }
      });
    });

    // Payment failures
    failedPayments.forEach(payment => {
      notifications.push({
        id: `payment-${payment.id}`,
        type: 'error',
        title: '결제 실패',
        message: `${payment.order.user.name}님의 결제가 실패했습니다`,
        time: payment.createdAt,
        priority: 'high',
        link: `/admin/orders/${payment.orderId}`,
        data: {
          paymentId: payment.id,
          orderId: payment.orderId,
          customerName: payment.order.user.name,
          amount: payment.amount
        }
      });
    });

    // New reviews
    recentReviews.forEach(review => {
      notifications.push({
        id: `review-${review.id}`,
        type: 'review',
        title: '새로운 리뷰',
        message: `${review.product.baseName}에 새 리뷰가 작성되었습니다`,
        time: review.createdAt,
        priority: 'normal',
        link: `/admin/reviews/${review.id}`,
        data: {
          reviewId: review.id,
          productName: review.product.baseName,
          rating: review.rating,
          reviewerName: review.user.name
        }
      });
    });

    // Sort by priority and time (high priority first, then by newest)
    const sortedNotifications = notifications.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'normal': 2, 'low': 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;

      if (aPriority !== bPriority) {
        return bPriority - aPriority; // High priority first
      }

      return new Date(b.time).getTime() - new Date(a.time).getTime(); // Newest first
    });

    // Get summary counts
    const summary = {
      total: notifications.length,
      unread: notifications.length, // All are considered unread for now
      high: notifications.filter(n => n.priority === 'high').length,
      normal: notifications.filter(n => n.priority === 'normal').length,
      low: notifications.filter(n => n.priority === 'low').length,
      types: {
        orders: notifications.filter(n => n.type === 'order').length,
        warnings: notifications.filter(n => n.type === 'warning').length,
        errors: notifications.filter(n => n.type === 'error').length,
        info: notifications.filter(n => n.type === 'info').length,
        reviews: notifications.filter(n => n.type === 'review').length
      }
    };

    return NextResponse.json({
      success: true,
      notifications: sortedNotifications.slice(0, 20), // Limit to 20 most recent
      summary,
      lastUpdated: now
    });

  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function POST(request: NextRequest) {
  try {
    const { notificationId } = await request.json();

    // In a real implementation, you would store read status in database
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}