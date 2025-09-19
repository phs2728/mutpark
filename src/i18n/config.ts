export const locales = ["ko", "tr", "en", "ru", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ko";

const rtlLocales: Locale[] = ["ar"];

export function isLocale(input: string): input is Locale {
  return locales.includes(input as Locale);
}

export function getDirection(locale: Locale) {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}
