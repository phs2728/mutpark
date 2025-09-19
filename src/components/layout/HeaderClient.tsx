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

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="flex items-center gap-8">
          <Link href={`/${locale}`} className="text-xl font-semibold" style={{ color: "var(--mut-color-text-primary)" }}>
            MutPark
          </Link>
          <nav className="app-header__nav hidden md:flex">
            <Link href={`/${locale}`}>{t("navigation.home")}</Link>
            <Link href={`/${locale}/products`}>{t("navigation.products")}</Link>
            <Link href={`/${locale}/community`}>{t("navigation.community")}</Link>
            <Link href={`/${locale}/recipes`}>{t("navigation.recipes")}</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher canSync={Boolean(user)} />
          <CurrencySwitcher canSync={Boolean(user)} />
          <Link href={`/${locale}/cart`} className="btn-secondary" style={{ position: "relative" }}>
            {t("navigation.cart")}
            {cartCount > 0 && (
              <span
                className="badge badge-success"
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  minWidth: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <Link href={`/${locale}/account`} className="chip">
              {user.name}
            </Link>
          ) : (
            <Link href={`/${locale}/auth/login`} className="chip">
              {t("navigation.login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
