import { LoginForm } from "@/components/auth/LoginForm";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const dictionary = await getDictionary(locale as Locale);

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {dictionary.auth.login.title}
      </h1>
      <LoginForm locale={locale} />
    </div>
  );
}
