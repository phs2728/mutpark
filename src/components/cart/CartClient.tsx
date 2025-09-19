"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/hooks/useCartStore";
import { useI18n } from "@/providers/I18nProvider";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import { resolveImageUrl } from "@/lib/imagekit";

export function CartClient({ locale }: { locale: string }) {
  const router = useRouter();
  const { t, locale: activeLocale } = useI18n();
  const items = useCartStore((state) => state.items);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotalDisplay = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  useEffect(() => {
    fetchCart().catch(() => undefined);
  }, [fetchCart]);

  if (items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p style={{ color: "var(--mut-color-text-secondary)" }}>{t("cart.empty")}</p>
        <button type="button" className="btn-primary mt-6" onClick={() => router.push(`/${locale}`)}>
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
            className="card flex flex-col gap-4 p-4 sm:flex-row"
          >
            <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
              {(() => {
                const imageSrc = resolveImageUrl(item.product.imageUrl, { width: 320, height: 320, quality: 80 });
                if (!imageSrc) return null;
                return (
                  <Image
                    src={imageSrc}
                    alt={item.product.name}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                );
              })()}
            </div>
            <div className="flex flex-1 flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/${locale}/products/${item.product.slug}`}
                    className="text-lg font-semibold"
                    style={{ color: "var(--mut-color-text-primary)" }}
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm" style={{ color: "var(--mut-color-text-secondary)" }}>
                    {formatCurrency(item.product.price, DEFAULT_CURRENCY, activeLocale)}
                  </p>
                </div>
                <button type="button" className="btn-outline" onClick={() => void removeItem(item.productId)}>
                  {t("cart.remove")}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: "var(--mut-color-text-secondary)" }}>
                  {t("cart.quantity")}
                </span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) =>
                    void updateItem(item.productId, Number(event.target.value))
                  }
                  className="input-field w-20"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold" style={{ color: "var(--mut-color-text-primary)" }}>
          {t("cart.title")}
        </h2>
        <div className="flex items-center justify-between text-sm" style={{ color: "var(--mut-color-text-secondary)" }}>
          <span>{t("cart.subtotal")}</span>
          <span className="text-lg font-semibold" style={{ color: "var(--mut-color-primary)" }}>
            {formatCurrency(subtotalDisplay, DEFAULT_CURRENCY, activeLocale)}
          </span>
        </div>
        <button type="button" onClick={() => router.push(`/${locale}/checkout`)} className="btn-primary w-full">
          {t("cart.checkout")}
        </button>
      </aside>
    </div>
  );
}
