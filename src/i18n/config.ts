export const locales = ["ko", "tr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ko";

export function isLocale(input: string): input is Locale {
  return locales.includes(input as Locale);
}
