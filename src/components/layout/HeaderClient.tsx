"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useI18n } from "@/providers/I18nProvider";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
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
    if (user) {
      fetchCart().catch(() => undefined);
    }
  }, [fetchCart, user]);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-12">
            <Link
              href={`/${locale}`}
              className="text-2xl font-bold text-emerald-600 transition-colors hover:text-emerald-700"
            >
              MutPark
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href={`/${locale}`}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
              >
                {t("navigation.home")}
              </Link>
              <Link
                href={`/${locale}/products`}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
              >
                {t("navigation.products")}
              </Link>
              <Link
                href={`/${locale}/recipes`}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
              >
                {t("navigation.recipes")}
              </Link>
              <Link
                href={`/${locale}/community`}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
              >
                {t("navigation.community")}
              </Link>
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher canSync={Boolean(user)} />

            {/* Cart */}
            <Link
              href={`/${locale}/cart`}
              className="relative rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h10a1 1 0 001-1v-6M9 19a1 1 0 100 2 1 1 0 000-2zM20 19a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                <span className="hidden sm:inline">{t("navigation.cart")}</span>
              </div>
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <Link
                href={`/${locale}/account`}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline">{user.name}</span>
                </div>
              </Link>
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                {t("navigation.login")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
