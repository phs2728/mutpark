import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account/ProfileForm";
import { getAuthenticatedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage({ params }: { params: { locale: string } }) {
  const auth = getAuthenticatedUser();
  if (!auth) {
    redirect(`/${params.locale}/auth/login`);
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
    redirect(`/${params.locale}/auth/login`);
  }

  return <ProfileForm initialProfile={user} />;
}
