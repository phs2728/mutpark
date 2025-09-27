import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/session";
import { defaultLocale, isLocale } from "@/i18n/config";
import { NewAddressForm } from "./NewAddressForm";

export default async function NewAddressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: paramLocale } = await params;
  const locale = isLocale(paramLocale) ? paramLocale : defaultLocale;
  const auth = await getAuthenticatedUser();

  if (!auth) {
    redirect(`/${locale}/auth/login`);
  }

  return <NewAddressForm locale={locale} />;
}