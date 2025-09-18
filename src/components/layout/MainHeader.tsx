import { HeaderClient } from "@/components/layout/HeaderClient";
import { getAuthenticatedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function MainHeader({ locale }: { locale: string }) {
  const authUser = getAuthenticatedUser();
  let user: { name: string; role: string } | null = null;

  if (authUser) {
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        name: true,
        role: true,
      },
    });
    if (dbUser) {
      user = dbUser;
    }
  }

  return <HeaderClient locale={locale} user={user} />;
}
