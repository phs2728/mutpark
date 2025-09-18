"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/providers/I18nProvider";
import { AddToCartButton } from "@/components/products/AddToCartButton";

interface ProductDetailProps {
  locale: string;
  product: {
    id: number;
    slug: string;
    name: string;
    description?: string | null;
    price: number;
    currency: string;
    imageUrl?: string | null;
    halalCertified: boolean;
    spiceLevel?: number | null;
    stock: number;
    brand?: string | null;
    category?: string | null;
  };
  related: Array<{
    id: number;
    slug: string;
    name: string;
    price: number;
    currency: string;
  }>;
}

export function ProductDetail({ locale, product, related }: ProductDetailProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-12">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative h-96 w-full bg-slate-100 dark:bg-slate-800">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                {product.name}
              </div>
            )}
            {product.halalCertified && (
              <span className="absolute left-4 top-4 rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-white">
                {t("products.halal")}
              </span>
            )}
          </div>
          <div className="space-y-4 p-6">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{product.name}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">{product.description}</p>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-emerald-600">
                {product.price.toLocaleString(undefined, {
                  style: "currency",
                  currency: product.currency,
                  minimumFractionDigits: 0,
                })}
              </span>
              {product.spiceLevel ? (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
                  {t("products.spiceLevel")}: {"🌶️".repeat(product.spiceLevel)}
                </span>
              ) : null}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {t("products.stock")}: {product.stock}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <AddToCartButton productId={product.id} className="px-8 py-3 text-base">
                {t("productDetail.actions.addToCart")}
              </AddToCartButton>
              <Link
                href={`/${locale}/checkout?productId=${product.id}`}
                className="rounded-full border border-emerald-500 px-8 py-3 text-base font-semibold text-emerald-600 hover:bg-emerald-50"
              >
                {t("productDetail.actions.checkout")}
              </Link>
            </div>
          </div>
        </div>
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t("products.featured")}</h2>
          <div className="space-y-3">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/products/${item.slug}`}
                className="flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 hover:border-emerald-200 dark:hover:border-emerald-500"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                <span className="text-sm font-semibold text-emerald-500">
                  {item.price.toLocaleString(undefined, {
                    style: "currency",
                    currency: item.currency,
                    minimumFractionDigits: 0,
                  })}
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
