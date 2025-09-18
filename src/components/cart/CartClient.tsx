"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/hooks/useCartStore";
import { useI18n } from "@/providers/I18nProvider";

export function CartClient({ locale }: { locale: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);

  useEffect(() => {
    fetchCart().catch(() => undefined);
  }, [fetchCart]);

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-300">{t("cart.empty")}</p>
        <button
          type="button"
          className="mt-6 rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          onClick={() => router.push(`/${locale}`)}
        >
          {t("cart.continue")}
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row"
          >
            <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
              {item.product.imageUrl ? (
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="flex flex-1 flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/${locale}/products/${item.product.slug}`}
                    className="text-lg font-semibold text-slate-900 hover:text-emerald-600 dark:text-white"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    {item.product.price.toLocaleString(undefined, {
                      style: "currency",
                      currency: item.product.currency,
                      minimumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm text-slate-400 hover:text-red-500"
                  onClick={() => void removeItem(item.productId)}
                >
                  {t("cart.remove")}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 dark:text-slate-300">{t("cart.quantity")}</span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) =>
                    void updateItem(item.productId, Number(event.target.value))
                  }
                  className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t("cart.title")}</h2>
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
          <span>{t("cart.subtotal")}</span>
          <span className="text-lg font-semibold text-emerald-600">
            {subtotal.toLocaleString(undefined, { style: "currency", currency: "TRY", minimumFractionDigits: 0 })}
          </span>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/checkout`)}
          className="w-full rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          {t("cart.checkout")}
        </button>
      </aside>
    </div>
  );
}
