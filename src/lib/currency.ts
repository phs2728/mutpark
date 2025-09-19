export const SUPPORTED_CURRENCIES = ["TRY", "USD", "EUR", "KRW"] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  TRY: 1,
  USD: 0.032,
  EUR: 0.029,
  KRW: 43,
};

export function isCurrency(code: string): code is CurrencyCode {
  return SUPPORTED_CURRENCIES.includes(code as CurrencyCode);
}

export function getSupportedCurrencies(): CurrencyCode[] {
  return [...SUPPORTED_CURRENCIES];
}

export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode) {
  if (!Number.isFinite(amount)) return 0;
  if (from === to) return amount;
  const base = amount / EXCHANGE_RATES[from];
  return base * EXCHANGE_RATES[to];
}

export function formatCurrency(amount: number, currency: CurrencyCode, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getCurrencyLabel(code: CurrencyCode) {
  switch (code) {
    case "TRY":
      return "TRY ₺";
    case "USD":
      return "USD $";
    case "EUR":
      return "EUR €";
    case "KRW":
      return "KRW ₩";
    default:
      return code;
  }
}
