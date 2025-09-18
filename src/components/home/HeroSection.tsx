"use client";

import Link from "next/link";
import { useI18n } from "@/providers/I18nProvider";

export function HeroSection({ locale }: { locale: string }) {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 px-6 py-16 text-white shadow-xl">
      <div className="relative z-10 max-w-3xl">
        <p className="text-sm uppercase tracking-wide text-emerald-100">MutPark</p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{t("hero.title")}</h1>
        <p className="mt-4 text-lg text-emerald-50">{t("hero.subtitle")}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={`/${locale}/products`}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-600 shadow-lg transition hover:bg-emerald-100"
          >
            {t("hero.ctaShop")}
          </Link>
          <Link
            href={`/${locale}/recipes`}
            className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {t("hero.ctaRecipes")}
          </Link>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
    </section>
  );
}
