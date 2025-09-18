import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account/ProfileForm";
import { getAuthenticatedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const auth = await getAuthenticatedUser();
  if (!auth) {
    redirect(`/${locale}/auth/login`);
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      name: true,
      phone: true,
      locale: true,
      currency: true,
    },
  });

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  return <ProfileForm initialProfile={user} />;
}
