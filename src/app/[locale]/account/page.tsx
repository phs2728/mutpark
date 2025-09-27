import { redirect } from "next/navigation";
import { MyPageDashboard } from "@/components/account/MyPageDashboard";
import { getAuthenticatedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { defaultLocale, isLocale } from "@/i18n/config";

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: paramLocale } = await params;
  const locale = isLocale(paramLocale) ? paramLocale : defaultLocale;
  const auth = await getAuthenticatedUser();

  if (!auth) {
    redirect(`/${locale}/auth/login`);
  }

  // Fetch user statistics
  const [orderStats, wishlistCount, reviewCount] = await Promise.all([
    prisma.order.aggregate({
      where: { userId: auth.userId },
      _count: {
        id: true
      }
    }),
    prisma.wishlistItem.count({
      where: { userId: auth.userId }
    }),
    prisma.productReview.count({
      where: { userId: auth.userId }
    })
  ]);

  const pendingOrders = await prisma.order.count({
    where: {
      userId: auth.userId,
      status: { in: ["PENDING", "AWAITING_PAYMENT", "PROCESSING"] }
    }
  });

  const addressCount = await prisma.address.count({
    where: { userId: auth.userId }
  });

  // Get recent orders
  const recentOrders = await prisma.order.findMany({
    where: { userId: auth.userId },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      createdAt: true
    }
  });

  const dashboardStats = {
    totalOrders: orderStats._count.id,
    pendingOrders,
    totalAddresses: addressCount,
    totalWishlistItems: wishlistCount,
    totalReviews: reviewCount,
    totalPoints: 0 // TODO: Implement points system
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <MyPageDashboard
        locale={locale}
        initialStats={dashboardStats}
        recentOrders={recentOrders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: Number(order.totalAmount),
          createdAt: order.createdAt.toISOString()
        }))}
      />
    </div>
  );
}
