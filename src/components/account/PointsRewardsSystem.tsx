"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/providers/I18nProvider";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

interface PointTransaction {
  id: number;
  type: "EARNED" | "SPENT" | "EXPIRED";
  amount: number;
  description: string;
  createdAt: string;
  orderId?: number;
  expiresAt?: string;
}

interface Reward {
  id: number;
  title: string;
  description: string;
  pointsCost: number;
  discountAmount?: number;
  discountType: "PERCENTAGE" | "FIXED";
  category: string;
  isActive: boolean;
  expiresAt?: string;
  imageUrl?: string;
  maxRedemptions?: number;
  userRedemptions: number;
}

interface PointsData {
  totalPoints: number;
  availablePoints: number;
  expiringSoon: number; // Points expiring in 30 days
  lifetimeEarned: number;
  lifetimeSpent: number;
  level: string;
  nextLevelPoints: number;
  transactions: PointTransaction[];
  availableRewards: Reward[];
}

interface PointsRewardsSystemProps {
  locale: string;
  initialData?: PointsData;
}

export function PointsRewardsSystem({ locale, initialData }: PointsRewardsSystemProps) {
  const { t } = useI18n();
  const [pointsData, setPointsData] = useState<PointsData>(initialData || {
    totalPoints: 0,
    availablePoints: 0,
    expiringSoon: 0,
    lifetimeEarned: 0,
    lifetimeSpent: 0,
    level: "BRONZE",
    nextLevelPoints: 500,
    transactions: [],
    availableRewards: []
  });

  const [isRedeeming, setIsRedeeming] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<"overview" | "transactions" | "rewards">("overview");

  const levelConfig = {
    BRONZE: {
      name: t("points.levels.bronze", "Bronz"),
      icon: "🥉",
      color: "text-orange-600",
      benefits: [
        t("points.benefits.bronze1", "Her 10₺ alışverişte 1 puan"),
        t("points.benefits.bronze2", "Doğum günü indirimi")
      ]
    },
    SILVER: {
      name: t("points.levels.silver", "Gümüş"),
      icon: "🥈",
      color: "text-gray-600",
      benefits: [
        t("points.benefits.silver1", "Her 10₺ alışverişte 1.5 puan"),
        t("points.benefits.silver2", "Ücretsiz kargo"),
        t("points.benefits.silver3", "Özel indirimler")
      ]
    },
    GOLD: {
      name: t("points.levels.gold", "Altın"),
      icon: "🥇",
      color: "text-yellow-600",
      benefits: [
        t("points.benefits.gold1", "Her 10₺ alışverişte 2 puan"),
        t("points.benefits.gold2", "Öncelikli müşteri hizmetleri"),
        t("points.benefits.gold3", "Erken erişim kampanyaları"),
        t("points.benefits.gold4", "Yıllık hediye")
      ]
    },
    PLATINUM: {
      name: t("points.levels.platinum", "Platin"),
      icon: "💎",
      color: "text-purple-600",
      benefits: [
        t("points.benefits.platinum1", "Her 10₺ alışverişte 3 puan"),
        t("points.benefits.platinum2", "Kişisel alışveriş danışmanı"),
        t("points.benefits.platinum3", "VIP etkinlik davetleri"),
        t("points.benefits.platinum4", "Maksimum indirim oranları")
      ]
    }
  };

  const currentLevel = levelConfig[pointsData.level as keyof typeof levelConfig] || levelConfig.BRONZE;

  const fetchPointsData = async () => {
    try {
      const response = await fetch("/api/profile/points");
      if (response.ok) {
        const data = await response.json();
        setPointsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch points data:", error);
    }
  };

  const handleRedeemReward = async (rewardId: number) => {
    setIsRedeeming(rewardId);

    try {
      const response = await fetch(`/api/rewards/${rewardId}/redeem`, {
        method: "POST"
      });

      if (response.ok) {
        const result = await response.json();
        // Update points and show success message
        await fetchPointsData();
        alert(t("points.redeemSuccess", "Ödül başarıyla kullanıldı!"));
      } else {
        throw new Error("Redemption failed");
      }
    } catch (error) {
      console.error("Reward redemption error:", error);
      alert(t("points.redeemError", "Ödül kullanılırken bir hata oluştu"));
    } finally {
      setIsRedeeming(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'EARNED': return '💰';
      case 'SPENT': return '💸';
      case 'EXPIRED': return '⏰';
      default: return '📋';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'EARNED': return 'text-green-600';
      case 'SPENT': return 'text-blue-600';
      case 'EXPIRED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const progressPercentage = (pointsData.availablePoints / pointsData.nextLevelPoints) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          🎁 {t("points.title", "Puanlarım ve Ödüllerim")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t("points.subtitle", "Alışveriş yaparak puan kazanın, ödüllerle tasarruf edin")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: "overview", label: t("points.tabs.overview", "Genel Bakış"), icon: "📊" },
          { id: "transactions", label: t("points.tabs.transactions", "Puan Geçmişi"), icon: "📋" },
          { id: "rewards", label: t("points.tabs.rewards", "Ödüller"), icon: "🎁" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              selectedTab === tab.id
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === "overview" && (
        <div className="space-y-6">
          {/* Points Summary */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-emerald-600">{pointsData.availablePoints}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("points.available", "Kullanılabilir Puan")}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-blue-600">{pointsData.lifetimeEarned}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("points.totalEarned", "Toplam Kazanılan")}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-purple-600">{pointsData.lifetimeSpent}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("points.totalSpent", "Toplam Kullanılan")}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-orange-600">{pointsData.expiringSoon}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("points.expiringSoon", "Yakında Sona Erecek")}
              </div>
            </div>
          </div>

          {/* Current Level */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{currentLevel.icon}</span>
                <div>
                  <h3 className={`text-xl font-bold ${currentLevel.color}`}>
                    {currentLevel.name} {t("points.member", "Üye")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("points.level", "Seviye")}: {pointsData.level}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("points.nextLevel", "Sonraki seviyeye")}
                </div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {pointsData.nextLevelPoints - pointsData.availablePoints} {t("points.pointsLeft", "puan kaldı")}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("points.progress", "İlerleme")}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {pointsData.availablePoints} / {pointsData.nextLevelPoints}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Level Benefits */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {t("points.benefits", "Seviye Avantajları")}:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {currentLevel.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* How to Earn Points */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💡 {t("points.howToEarn", "Puan Nasıl Kazanılır")}
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span>🛍️</span>
                  <span>{t("points.earnShopping", "Alışveriş: Her 10₺'de 1-3 puan")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>⭐</span>
                  <span>{t("points.earnReview", "Ürün değerlendirmesi: 10 puan")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>👥</span>
                  <span>{t("points.earnReferral", "Arkadaş davet: 50 puan")}</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span>🎂</span>
                  <span>{t("points.earnBirthday", "Doğum günü hediyesi: 100 puan")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📱</span>
                  <span>{t("points.earnApp", "Mobil uygulama: 25 puan")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  <span>{t("points.earnNewsletter", "E-bülten aboneliği: 15 puan")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {selectedTab === "transactions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              📋 {t("points.transactionHistory", "Puan Geçmişi")}
            </h2>
            <button
              onClick={fetchPointsData}
              className="btn-outline text-sm"
            >
              🔄 {t("points.refresh", "Yenile")}
            </button>
          </div>

          {pointsData.transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t("points.noTransactions", "Henüz puan işleminiz yok")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("points.startEarning", "Alışveriş yaparak puan kazanmaya başlayın!")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pointsData.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(transaction.createdAt)}
                          {transaction.expiresAt && (
                            <span> • {t("points.expires", "Bitiş")}: {formatDate(transaction.expiresAt)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'SPENT' || transaction.type === 'EXPIRED' ? '-' : '+'}
                        {transaction.amount} {t("points.points", "puan")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rewards Tab */}
      {selectedTab === "rewards" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              🎁 {t("points.availableRewards", "Kullanılabilir Ödüller")}
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("points.yourPoints", "Puanınız")}: <span className="font-bold text-emerald-600">{pointsData.availablePoints}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pointsData.availableRewards.map((reward) => {
              const canAfford = pointsData.availablePoints >= reward.pointsCost;
              const maxReached = reward.maxRedemptions && reward.userRedemptions >= reward.maxRedemptions;

              return (
                <div
                  key={reward.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg border p-6 transition-all ${
                    canAfford && !maxReached
                      ? "border-emerald-200 hover:border-emerald-300"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {/* Reward Image */}
                  <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    {reward.imageUrl ? (
                      <img
                        src={reward.imageUrl}
                        alt={reward.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-4xl">🎁</span>
                    )}
                  </div>

                  {/* Reward Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {reward.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {reward.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-emerald-600">
                        {reward.pointsCost} {t("points.points", "puan")}
                      </div>
                      {reward.discountAmount && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {reward.discountType === "PERCENTAGE" ? `%${reward.discountAmount}` : `${reward.discountAmount}₺`} {t("points.discount", "indirim")}
                        </div>
                      )}
                    </div>

                    {reward.expiresAt && (
                      <div className="text-xs text-orange-600">
                        ⏰ {t("points.expires", "Bitiş")}: {formatDate(reward.expiresAt)}
                      </div>
                    )}

                    {maxReached && (
                      <div className="text-xs text-red-600">
                        🚫 {t("points.maxReached", "Maksimum kullanım sayısına ulaşıldı")}
                      </div>
                    )}

                    <button
                      onClick={() => handleRedeemReward(reward.id)}
                      disabled={!canAfford || maxReached || isRedeeming === reward.id}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        canAfford && !maxReached
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isRedeeming === reward.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {t("points.redeeming", "Kullanılıyor...")}
                        </span>
                      ) : canAfford && !maxReached ? (
                        t("points.redeem", "Kullan")
                      ) : !canAfford ? (
                        t("points.notEnoughPoints", "Yetersiz Puan")
                      ) : (
                        t("points.maxReached", "Sınır Aşıldı")
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}