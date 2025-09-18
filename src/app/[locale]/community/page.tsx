import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function CommunityPlaceholder({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dictionary = await getDictionary(locale as Locale);

  return (
    <div className="rounded-3xl border border-dashed border-emerald-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-emerald-700 dark:bg-slate-900 dark:text-slate-300">
      <p>{dictionary.community.placeholder}</p>
    </div>
  );
}
