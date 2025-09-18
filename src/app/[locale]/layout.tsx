import { ReactNode } from "react";
import { MainHeader } from "@/components/layout/MainHeader";
import { MainFooter } from "@/components/layout/MainFooter";
import { I18nProvider } from "@/providers/I18nProvider";
import { defaultLocale, isLocale, type Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dictionary = await getDictionary(locale as Locale);

  return (
    <I18nProvider locale={locale} messages={dictionary}>
      <div className="flex min-h-screen flex-col">
        <MainHeader locale={locale} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
        <MainFooter />
      </div>
    </I18nProvider>
  );
}
