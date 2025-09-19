export const SUPPORTED_CURRENCIES = ["TRY"] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];
export const DEFAULT_CURRENCY: CurrencyCode = "TRY";

export function isCurrency(code: string): code is CurrencyCode {
  return code === DEFAULT_CURRENCY;
}

export function convertCurrency(amount: number, _from?: CurrencyCode, _to?: CurrencyCode): number {
  void _from;
  void _to;
  return Number.isFinite(amount) ? amount : 0;
}

export function getDefaultCurrency(): CurrencyCode {
  return DEFAULT_CURRENCY;
}

export function getSupportedCurrencies(): CurrencyCode[] {
  return SUPPORTED_CURRENCIES as unknown as CurrencyCode[];
}

export function formatCurrency(amount: number, currency: CurrencyCode, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getCurrencyLabel(code: CurrencyCode) {
  return code === "TRY" ? "TRY ₺" : code;
}
