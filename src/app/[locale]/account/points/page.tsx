import { redirect } from "next/navigation";
import { PointsRewardsSystem } from "@/components/account/PointsRewardsSystem";
import { getAuthenticatedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { defaultLocale, isLocale } from "@/i18n/config";

export default async function PointsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: paramLocale } = await params;
  const locale = isLocale(paramLocale) ? paramLocale : defaultLocale;
  const auth = await getAuthenticatedUser();

  if (!auth) {
    redirect(`/${locale}/auth/login`);
  }

  // Fetch user data for points calculation
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      name: true,
      createdAt: true
    }
  });

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // Calculate points based on user activity
  const [orderCount, reviewCount, totalSpent] = await Promise.all([
    prisma.order.count({
      where: {
        userId: auth.userId,
        status: "DELIVERED"
      }
    }),
    prisma.productReview.count({
      where: { userId: auth.userId }
    }),
    prisma.order.aggregate({
      where: {
        userId: auth.userId,
        status: "DELIVERED"
      },
      _sum: {
        totalAmount: true
      }
    })
  ]);

  // Simple points calculation
  const totalPoints = (orderCount * 10) + (reviewCount * 5) + Math.floor(Number(totalSpent._sum.totalAmount || 0) / 100);

  // Determine level based on points
  let level: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" = "BRONZE";
  if (totalPoints >= 1000) level = "PLATINUM";
  else if (totalPoints >= 500) level = "GOLD";
  else if (totalPoints >= 100) level = "SILVER";

  const pointsData = {
    totalPoints,
    availablePoints: totalPoints,
    expiringSoon: 0,
    lifetimeEarned: totalPoints,
    lifetimeSpent: 0,
    level,
    nextLevelPoints: level === "PLATINUM" ? 0 :
      level === "GOLD" ? 1000 - totalPoints :
      level === "SILVER" ? 500 - totalPoints :
      100 - totalPoints,
    transactions: [],
    availableRewards: []
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PointsRewardsSystem
        locale={locale}
        initialData={pointsData}
      />
    </div>
  );
}