"use client";

import { useState, useTransition } from "react";
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

const flags: Record<Locale, string> = {
  ko: "🇰🇷",
  tr: "🇹🇷",
  en: "🇺🇸",
  ru: "🇷🇺",
  ar: "🇸🇦",
};

interface LanguageSwitcherProps {
  canSync?: boolean;
}

export function LanguageSwitcher({ canSync = false }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

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
    setIsOpen(false);

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
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        disabled={isPending}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-base">{flags[locale]}</span>
        <span>{labels[locale]}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 z-20 mt-1 min-w-[160px] rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            {locales.map((loc) => {
              const isActive = loc === locale;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleChange(loc)}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                  }`}
                  disabled={isPending}
                >
                  <span className="text-base">{flags[loc]}</span>
                  <span>{labels[loc]}</span>
                  {isActive && (
                    <span className="ml-auto text-emerald-600 dark:text-emerald-400">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
