"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useI18n } from "@/providers/I18nProvider";

interface ReviewAuthor {
  id: number;
  name: string;
}

interface ProductReviewItem {
  id: number;
  rating: number;
  title?: string | null;
  content: string;
  imageUrls: string[];
  helpfulCount: number;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
  author: ReviewAuthor;
  isHelpfulByUser?: boolean;
}

interface ReviewResponsePayload {
  reviews: ProductReviewItem[];
  page: number;
  pageSize: number;
  total: number;
  averageRating: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

interface ProductReviewsProps {
  productId: number;
  locale: string;
  currentUserId?: number | null;
}

function formatDate(date: string, locale: string) {
  const value = new Date(date);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(value);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorBody?.message ?? "Request failed");
  }
  return (await response.json()) as T;
}

export function ProductReviews({ productId, locale, currentUserId }: ProductReviewsProps) {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<ProductReviewItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [distribution, setDistribution] = useState<Record<1 | 2 | 3 | 4 | 5, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImageUrls, setFormImageUrls] = useState<string[]>([]);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [helpfulLoading, setHelpfulLoading] = useState<Set<number>>(new Set());
  const [imageUploading, setImageUploading] = useState(false);

  // Sorting and filtering state
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'>('newest');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [withImagesOnly, setWithImagesOnly] = useState(false);

  const totalPages = useMemo(() => {
    if (pageSize === 0) return 1;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  const userReview = useMemo(() => {
    if (!currentUserId) return null;
    return reviews.find((review) => review.author.id === currentUserId) ?? null;
  }, [currentUserId, reviews]);

  const fetchReviews = useCallback(
    async (pageNumber: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: pageNumber.toString(),
          sortBy,
          verifiedOnly: verifiedOnly.toString(),
          withImagesOnly: withImagesOnly.toString(),
        });

        if (ratingFilter) {
          params.set('rating', ratingFilter.toString());
        }

        const response = await fetch(`/api/products/${productId}/reviews?${params}`, {
          credentials: "include",
        });
        const json = await handleResponse<{ data: ReviewResponsePayload }>(response);
        const payload = json.data;
        setReviews(payload.reviews);
        setPage(payload.page);
        setPageSize(payload.pageSize);
        setTotal(payload.total);
        setAverageRating(payload.averageRating);
        setDistribution(payload.ratingDistribution);

        if (currentUserId) {
          const matched = payload.reviews.find((item) => item.author.id === currentUserId);
          if (matched) {
            setFormRating(matched.rating);
            setFormTitle(matched.title ?? "");
            setFormContent(matched.content);
            setFormImageUrls(matched.imageUrls);
          }
        }
      } catch (fetchError) {
        setError((fetchError as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [productId, currentUserId, sortBy, ratingFilter, verifiedOnly, withImagesOnly],
  );

  useEffect(() => {
    void fetchReviews(page);
  }, [page, fetchReviews]);

  const handleCreateOrUpdate = useCallback(() => {
    startSubmitTransition(async () => {
      try {
        setError(null);
        const response = await fetch(`/api/products/${productId}/reviews`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: formRating,
            title: formTitle || undefined,
            content: formContent,
            imageUrls: formImageUrls,
          }),
        });
        await handleResponse(response);
        await fetchReviews(1);
      } catch (submitError) {
        setError((submitError as Error).message);
      }
    });
  }, [productId, formRating, formTitle, formContent, fetchReviews]);

  const handleDelete = useCallback(() => {
    if (!userReview) return;
    startDeleteTransition(async () => {
      try {
        setError(null);
        const response = await fetch(`/api/products/${productId}/reviews/${userReview.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        await handleResponse(response);
        setFormRating(5);
        setFormTitle("");
        setFormContent("");
        setFormImageUrls([]);
        await fetchReviews(1);
      } catch (deleteError) {
        setError((deleteError as Error).message);
      }
    });
  }, [productId, userReview, fetchReviews]);

  const handleHelpfulToggle = useCallback(async (reviewId: number, isCurrentlyHelpful: boolean) => {
    if (!currentUserId) return;

    setHelpfulLoading(prev => new Set(prev).add(reviewId));

    try {
      const method = isCurrentlyHelpful ? "DELETE" : "POST";
      const response = await fetch(`/api/products/${productId}/reviews/${reviewId}/helpful`, {
        method,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update helpful status");
      }

      // Update the local state
      setReviews(prev => prev.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            isHelpfulByUser: !isCurrentlyHelpful,
            helpfulCount: isCurrentlyHelpful ? review.helpfulCount - 1 : review.helpfulCount + 1
          };
        }
        return review;
      }));
    } catch (error) {
      console.error("Error toggling helpful:", error);
      setError(error instanceof Error ? error.message : t("notifications.error"));
    } finally {
      setHelpfulLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  }, [currentUserId, productId]);

  const handleImageUpload = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return;

    if (formImageUrls.length + files.length > 6) {
      setError("Maximum 6 images allowed");
      return;
    }

    setImageUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      const response = await fetch("/api/uploads/review-images", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to upload images");
      }

      const data = await response.json();
      if (data.success) {
        setFormImageUrls(prev => [...prev, ...data.data.urls]);
      } else {
        throw new Error(data.message || "Failed to upload images");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setError(error instanceof Error ? error.message : t("notifications.error"));
    } finally {
      setImageUploading(false);
    }
  }, [formImageUrls.length]);

  const handleImageRemove = useCallback((index: number) => {
    setFormImageUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {t("reviews.title")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            {t("reviews.subtitle")} ({total})
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 px-4 py-2 text-right dark:border-slate-700">
          <p className="text-3xl font-semibold text-emerald-600">
            {averageRating.toFixed(1)}
          </p>
          <p className="text-xs uppercase text-slate-500 dark:text-slate-300">
            {t("reviews.average")}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t("reviews.ratingBreakdown")}
          </h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating as 1 | 2 | 3 | 4 | 5] ?? 0;
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={rating} className="flex items-center gap-3 text-sm">
                  <span className="w-10 text-right font-medium">{rating}★</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-xs text-slate-500 dark:text-slate-300">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Sorting and Filtering Controls */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("reviews.sortBy")}
            </h4>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="w-full text-sm rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="newest">{t("reviews.sortNewest")}</option>
              <option value="oldest">{t("reviews.sortOldest")}</option>
              <option value="rating_high">{t("reviews.sortRatingHigh")}</option>
              <option value="rating_low">{t("reviews.sortRatingLow")}</option>
              <option value="helpful">{t("reviews.sortMostHelpful")}</option>
            </select>

            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("reviews.filterBy")}
            </h4>
            <select
              value={ratingFilter || ""}
              onChange={(e) => {
                setRatingFilter(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }}
              className="w-full text-sm rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">{t("reviews.allRatings")}</option>
              <option value="5">{t("reviews.star5")}</option>
              <option value="4">{t("reviews.star4")}</option>
              <option value="3">{t("reviews.star3")}</option>
              <option value="2">{t("reviews.star2")}</option>
              <option value="1">{t("reviews.star1")}</option>
            </select>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => {
                    setVerifiedOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-slate-300 text-emerald-600 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-slate-700 dark:text-slate-200">{t("reviews.verifiedOnly")}</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={withImagesOnly}
                  onChange={(e) => {
                    setWithImagesOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-slate-300 text-emerald-600 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-slate-700 dark:text-slate-200">{t("reviews.withImagesOnly")}</span>
              </label>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          {currentUserId ? (
            <form
              className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              onSubmit={(event) => {
                event.preventDefault();
                handleCreateOrUpdate();
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {userReview ? t("reviews.updateTitle") : t("reviews.createTitle")}
                </h3>
                {userReview ? (
                  <button
                    type="button"
                    className="text-sm font-semibold text-rose-500"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? t("common.loading") : t("reviews.delete")}
                  </button>
                ) : null}
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {t("reviews.ratingLabel")}
                </span>
                <select
                  value={formRating}
                  onChange={(event) => setFormRating(Number(event.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} ★
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {t("reviews.titleLabel")}
                </span>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(event) => setFormTitle(event.target.value)}
                  placeholder={t("reviews.titlePlaceholder")}
                  maxLength={200}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {t("reviews.contentLabel")}
                </span>
                <textarea
                  value={formContent}
                  onChange={(event) => setFormContent(event.target.value)}
                  placeholder={t("reviews.contentPlaceholder")}
                  minLength={10}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  required
                />
              </label>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                <span>{t("reviews.contentHelper")}</span>
                <span>
                  {formContent.length}/2000
                </span>
              </div>

              {/* 이미지 업로드 섹션 */}
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {t("reviews.uploadImages")}
                  </span>
                  <div className="mt-1 flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:hover:border-slate-500">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {imageUploading ? (
                          <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                        ) : (
                          <svg className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        )}
                        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">{imageUploading ? t("reviews.uploading") : t("reviews.uploadImagesButton")}</span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t("reviews.uploadImagesHelper")}</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                        disabled={imageUploading || formImageUrls.length >= 6}
                      />
                    </label>
                  </div>
                </label>

                {/* 업로드된 이미지 미리보기 */}
                {formImageUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {formImageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`리뷰 이미지 ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || formContent.length < 10}
                >
                  {isSubmitting ? t("common.loading") : userReview ? t("reviews.save") : t("reviews.submit")}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-3xl border border-dashed border-emerald-300 bg-emerald-50 p-6 text-sm text-emerald-700 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-200">
              {t("reviews.loginPrompt")}
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">{t("common.loading")}</p>
            ) : error ? (
              <p className="text-sm text-rose-500">{error}</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">{t("reviews.empty")}</p>
            ) : (
              reviews.map((review) => (
                <article
                  key={review.id}
                  className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <header className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{review.author.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-300">
                        {formatDate(review.createdAt, locale)}
                        {review.verifiedPurchase ? ` · ${t("reviews.verified")}` : ""}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                      {review.rating} ★
                    </span>
                  </header>
                  {review.title ? (
                    <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      {review.title}
                    </h4>
                  ) : null}
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {review.content}
                  </p>
                  {review.imageUrls.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {review.imageUrls.map((url, index) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative block overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors"
                        >
                          <img
                            src={url}
                            alt={`리뷰 이미지 ${index + 1}`}
                            className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                              {t("reviews.viewImage")}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : null}

                  {/* 도움이 되었나요 버튼 */}
                  {currentUserId && review.author.id !== currentUserId && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => handleHelpfulToggle(review.id, review.isHelpfulByUser || false)}
                        disabled={helpfulLoading.has(review.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          review.isHelpfulByUser
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {helpfulLoading.has(review.id) ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V18m-7-8a2 2 0 01-2-2V6a2 2 0 012-2h2.343M11 7L9 5m-6 0h2m0 0V3m0 0h.01M9 5v2.99" />
                          </svg>
                        )}
                        <span>
                          {review.isHelpfulByUser ? t("reviews.helpfulMarked") : t("reviews.helpful")}
                        </span>
                        {review.helpfulCount > 0 && (
                          <span className="px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded-full text-xs">
                            {review.helpfulCount}
                          </span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* 도움이 되었나요 카운터만 표시 (로그인하지 않은 사용자 또는 본인 리뷰) */}
                  {(!currentUserId || review.author.id === currentUserId) && review.helpfulCount > 0 && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V18m-7-8a2 2 0 01-2-2V6a2 2 0 012-2h2.343M11 7L9 5m-6 0h2m0 0V3m0 0h.01M9 5v2.99" />
                        </svg>
                        <span>{t("reviews.helpfulCount", { count: review.helpfulCount })}</span>
                      </div>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                className="text-emerald-600 disabled:text-slate-400"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || loading}
              >
                ← {t("reviews.prev")}
              </button>
              <span className="text-xs text-slate-500 dark:text-slate-300">
                {t("reviews.pageIndicator")} {page} / {totalPages}
              </span>
              <button
                type="button"
                className="text-emerald-600 disabled:text-slate-400"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages || loading}
              >
                {t("reviews.next")} →
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
