"use client";

import { useTransition } from "react";
import { useI18n } from "@/providers/I18nProvider";
import { getCurrencyLabel, getSupportedCurrencies, isCurrency } from "@/lib/currency";
import { useCurrency } from "@/providers/CurrencyProvider";

interface CurrencySwitcherProps {
  canSync?: boolean;
}

export function CurrencySwitcher({ canSync = false }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <span className="hidden text-xs uppercase text-slate-400 sm:inline">{t("navigation.currency", "Currency")}</span>
      <select
        value={currency}
        onChange={(event) => {
          const value = event.target.value;
          if (!isCurrency(value)) return;
          setCurrency(value);
          if (canSync) {
            startTransition(() => {
              void fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currency: value }),
              }).catch(() => undefined);
            });
          }
        }}
        className="select-input"
        disabled={isPending}
      >
        {getSupportedCurrencies().map((code) => (
          <option key={code} value={code}>
            {getCurrencyLabel(code)}
          </option>
        ))}
      </select>
    </label>
  );
}
