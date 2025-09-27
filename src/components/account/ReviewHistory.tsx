"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/providers/I18nProvider";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  helpful: number;
  product: {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string;
    price: number;
  };
  reviewImages?: string[];
  isVerifiedPurchase: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface ReviewHistoryProps {
  locale: string;
  initialReviews?: Review[];
}

export function ReviewHistory({ locale, initialReviews = [] }: ReviewHistoryProps) {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const statusConfig = {
    PENDING: {
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      icon: "⏳",
      label: t("review.status.pending", "İnceleme Bekliyor")
    },
    APPROVED: {
      color: "text-green-600 bg-green-50 border-green-200",
      icon: "✅",
      label: t("review.status.approved", "Yayınlandı")
    },
    REJECTED: {
      color: "text-red-600 bg-red-50 border-red-200",
      icon: "❌",
      label: t("review.status.rejected", "Reddedildi")
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/profile/reviews");
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm(t("review.deleteConfirm", "Bu değerlendirmeyi silmek istediğinizden emin misiniz?"))) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setReviews(prev => prev.filter(review => review.id !== reviewId));
      }
    } catch (error) {
      console.error("Delete review error:", error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? "text-yellow-400" : "text-gray-300"}
      >
        ⭐
      </span>
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getReviewStats = () => {
    const total = reviews.length;
    const approved = reviews.filter(r => r.status === 'APPROVED').length;
    const pending = reviews.filter(r => r.status === 'PENDING').length;
    const avgRating = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const totalHelpful = reviews.reduce((sum, r) => sum + r.helpful, 0);

    return { total, approved, pending, avgRating, totalHelpful };
  };

  const stats = getReviewStats();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ⭐ {t("review.history", "Değerlendirmelerim")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("review.subtitle", "Yazdığınız ürün değerlendirmeleri")}
          </p>
        </div>
        <button
          onClick={fetchReviews}
          disabled={loading}
          className="btn-outline disabled:opacity-50"
        >
          {loading ? "🔄" : "🔄"} {t("review.refresh", "Yenile")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t("review.stats.total", "Toplam")}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t("review.stats.approved", "Yayınlanan")}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t("review.stats.pending", "Bekleyen")}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600">{stats.avgRating.toFixed(1)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t("review.stats.avgRating", "Ortalama Puan")}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">{stats.totalHelpful}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t("review.stats.helpful", "Beğeni")}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("review.noReviews", "Henüz değerlendirmeniz yok")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("review.startReviewing", "Satın aldığınız ürünleri değerlendirerek diğer müşterilere yardımcı olun")}
          </p>
          <Link href={`/${locale}/account/orders`} className="btn-primary">
            📦 {t("review.viewOrders", "Siparişlerimi Gör")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const status = statusConfig[review.status];

            return (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                        {review.product.imageUrl ? (
                          <img
                            src={review.product.imageUrl}
                            alt={review.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div>
                        <Link
                          href={`/${locale}/products/${review.product.slug}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-emerald-600"
                        >
                          {review.product.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ({review.rating}/5)
                          </span>
                          {review.isVerifiedPurchase && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              ✓ {t("review.verified", "Doğrulanmış Alım")}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {formatDate(review.createdAt)}
                          {review.updatedAt !== review.createdAt && (
                            <span> • {t("review.edited", "Düzenlendi")}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                        {status.icon} {status.label}
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="space-y-3">
                    {review.comment && (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        "{review.comment}"
                      </p>
                    )}

                    {/* Review Images */}
                    {review.reviewImages && review.reviewImages.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {review.reviewImages.map((image, index) => (
                          <div
                            key={index}
                            className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                          >
                            <img
                              src={image}
                              alt={`Review image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Helpful Count */}
                    {review.helpful > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>👍</span>
                        <span>
                          {review.helpful} {t("review.helpfulCount", "kişi bu yorumu yararlı buldu")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Review Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/${locale}/products/${review.product.slug}#review-${review.id}`}
                      className="btn-outline text-sm"
                    >
                      👁️ {t("review.viewOnProduct", "Üründe Gör")}
                    </Link>

                    {review.status === 'APPROVED' && (
                      <button
                        onClick={() => {/* Share review */}}
                        className="btn-outline text-sm"
                      >
                        📤 {t("review.share", "Paylaş")}
                      </button>
                    )}

                    {review.status === 'PENDING' && (
                      <button
                        onClick={() => {/* Edit review */}}
                        className="btn-outline text-sm"
                      >
                        ✏️ {t("review.edit", "Düzenle")}
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      🗑️ {t("review.delete", "Sil")}
                    </button>

                    <Link
                      href={`/${locale}/products/${review.product.slug}`}
                      className="btn-primary text-sm"
                    >
                      🔄 {t("review.buyAgain", "Tekrar Sipariş Ver")}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Writing Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💡 {t("review.tips.title", "İyi Değerlendirme İpuçları")}
        </h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <li>• {t("review.tips.honest", "Dürüst ve samimi değerlendirmeler yazın")}</li>
          <li>• {t("review.tips.detailed", "Ürünün özelliklerini detaylı açıklayın")}</li>
          <li>• {t("review.tips.photos", "Fotoğraf ekleyerek değerlendirmenizi destekleyin")}</li>
          <li>• {t("review.tips.pros", "Olumlu ve olumsuz yönleri belirtin")}</li>
          <li>• {t("review.tips.respectful", "Saygılı bir dil kullanın")}</li>
        </ul>
      </div>
    </div>
  );
}