"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Locale, locales } from "@/i18n/config";
import { useI18n } from "@/providers/I18nProvider";

const labels: Record<Locale, string> = {
  ko: "한국어",
  tr: "Türkçe",
  en: "English",
  ru: "Русский",
  ar: "العربية",
};

interface LanguageSwitcherProps {
  canSync?: boolean;
}

export function LanguageSwitcher({ canSync = false }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useI18n();
  const [isPending, startTransition] = useTransition();

  const handleChange = (nextLocale: string) => {
    if (nextLocale === locale) return;

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      router.push(`/${nextLocale}`);
      return;
    }

    if (locales.includes(segments[0] as (typeof locales)[number])) {
      segments[0] = nextLocale;
    } else {
      segments.unshift(nextLocale);
    }

    router.push(`/${segments.join("/")}`);

    if (canSync) {
      startTransition(() => {
        void fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: nextLocale }),
        }).catch(() => undefined);
      });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {locales.map((loc) => {
        const isActive = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => handleChange(loc)}
            className={`relative flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
              isActive
                ? "border-emerald-500 bg-emerald-500 text-white shadow-lg"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-500"
            }`}
            disabled={isPending}
            aria-pressed={isActive}
          >
            <span>{labels[loc] ?? loc.toUpperCase()}</span>
            {isActive ? (
              <span className="ml-2 text-xs font-bold" aria-hidden>
                ✓
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
