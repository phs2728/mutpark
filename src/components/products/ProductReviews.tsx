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
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

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
        const response = await fetch(`/api/products/${productId}/reviews?page=${pageNumber}`, {
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
          }
        }
      } catch (fetchError) {
        setError((fetchError as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [productId, currentUserId],
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
        await fetchReviews(1);
      } catch (deleteError) {
        setError((deleteError as Error).message);
      }
    });
  }, [productId, userReview, fetchReviews]);

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
                    <div className="flex flex-wrap gap-3">
                      {review.imageUrls.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 text-xs text-slate-500 hover:border-emerald-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-500"
                        >
                          {t("reviews.viewImage")}
                        </a>
                      ))}
                    </div>
                  ) : null}
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
