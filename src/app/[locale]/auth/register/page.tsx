import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function RegisterPage({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dictionary = await getDictionary(locale as Locale);

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {dictionary.auth.register.title}
      </h1>
      <RegisterForm locale={locale} />
      <p className="text-sm text-slate-500 dark:text-slate-300">
        <Link href={`/${locale}/auth/login`} className="font-semibold text-emerald-600">
          {dictionary.auth.login.title}
        </Link>
      </p>
    </div>
  );
}
