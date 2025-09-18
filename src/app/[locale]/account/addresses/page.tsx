import { redirect } from "next/navigation";
import { AddressManager } from "@/components/account/AddressManager";
import { getAuthenticatedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AddressesPage({ params }: { params: { locale: string } }) {
  const auth = getAuthenticatedUser();
  if (!auth) {
    redirect(`/${params.locale}/auth/login`);
  }

  const addresses = await prisma.address.findMany({
    where: { userId: auth.userId },
    orderBy: { isDefault: "desc" },
  });

  return <AddressManager initialAddresses={addresses} />;
}
