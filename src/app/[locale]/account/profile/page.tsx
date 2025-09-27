import { redirect } from "next/navigation";
import { ProfileEditor } from "@/components/account/ProfileEditor";
import { getAuthenticatedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { defaultLocale, isLocale } from "@/i18n/config";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: paramLocale } = await params;
  const locale = isLocale(paramLocale) ? paramLocale : defaultLocale;
  const auth = await getAuthenticatedUser();

  if (!auth) {
    redirect(`/${locale}/auth/login`);
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: {
      preferences: true
    }
  });

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const profileData = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    locale: user.locale,
    currency: user.currency,
    avatar: "",
    marketingConsent: user.preferences?.marketingNotifications ?? false,
    smsConsent: false,
    emailConsent: user.preferences?.emailNotifications ?? true
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileEditor
        locale={locale}
        initialData={profileData}
      />
    </div>
  );
}
