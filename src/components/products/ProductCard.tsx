"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/providers/I18nProvider";
import { useCartStore } from "@/hooks/useCartStore";

interface ProductCardProps {
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
  };
}

export function ProductCard({ locale, product }: ProductCardProps) {
  const { t } = useI18n();
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    void addItem(product.id, 1);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            {product.name}
          </div>
        )}
        {product.halalCertified && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
            {t("products.halal")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-300">
            {product.description}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {product.price.toLocaleString(undefined, {
                style: "currency",
                currency: product.currency,
                minimumFractionDigits: 0,
              })}
            </p>
            {product.spiceLevel ? (
              <p className="text-xs text-orange-500">
                {t("products.spiceLevel")}: {"🌶️".repeat(product.spiceLevel)}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/${locale}/products/${product.slug}`}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
            >
              {t("products.viewDetails")}
            </Link>
            <button
              type="button"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
              onClick={handleAddToCart}
            >
              {t("products.addToCart")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
