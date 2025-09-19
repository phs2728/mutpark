"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useI18n } from "@/providers/I18nProvider";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/common/CurrencySwitcher";
import { useCartStore } from "@/hooks/useCartStore";

interface HeaderClientProps {
  locale: string;
  user?: {
    name: string;
    role: string;
  } | null;
}

export function HeaderClient({ locale, user }: HeaderClientProps) {
  const { t } = useI18n();
  const items = useCartStore((state) => state.items);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    fetchCart().catch(() => undefined);
  }, [fetchCart]);

  const navClass = "text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white";
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <Link href={`/${locale}`} className="text-xl font-semibold text-slate-900 dark:text-white">
            MutPark
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link href={`/${locale}`} className={navClass}>
              {t("navigation.home")}
            </Link>
            <Link href={`/${locale}/products`} className={navClass}>
              {t("navigation.products")}
            </Link>
            <Link href={`/${locale}/community`} className={navClass}>
              {t("navigation.community")}
            </Link>
            <Link href={`/${locale}/recipes`} className={navClass}>
              {t("navigation.recipes")}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher canSync={Boolean(user)} />
          <CurrencySwitcher canSync={Boolean(user)} />
          <Link href={`/${locale}/cart`} className="relative rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {t("navigation.cart")}
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <Link href={`/${locale}/account`} className={navClass}>
              {user.name}
            </Link>
          ) : (
            <Link href={`/${locale}/auth/login`} className={navClass}>
              {t("navigation.login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
