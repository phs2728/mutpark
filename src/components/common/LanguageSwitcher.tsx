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
    <div className="flex items-center gap-1">
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => handleChange(loc)}
          className={`rounded-full px-3 py-1 text-sm transition-colors ${
            loc === locale
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          }`}
          disabled={isPending}
        >
          {labels[loc] ?? loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
