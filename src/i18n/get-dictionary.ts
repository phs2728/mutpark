import type { Locale } from "@/i18n/config";

const dictionaries = {
  ko: () => import("@/i18n/locales/ko.json").then((module) => module.default),
  tr: () => import("@/i18n/locales/tr.json").then((module) => module.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["ko"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const dictionaryLoader = dictionaries[locale] ?? dictionaries.ko;
  return dictionaryLoader();
}
