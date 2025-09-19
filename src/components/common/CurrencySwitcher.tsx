"use client";

import { useI18n } from "@/providers/I18nProvider";
import { getCurrencyLabel, getSupportedCurrencies, isCurrency } from "@/lib/currency";
import { useCurrency } from "@/providers/CurrencyProvider";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const { t } = useI18n();

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <span className="hidden text-xs uppercase text-slate-400 sm:inline">{t("navigation.currency", "Currency")}</span>
      <select
        value={currency}
        onChange={(event) => {
          const value = event.target.value;
          if (isCurrency(value)) {
            setCurrency(value);
          }
        }}
        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
