import { redirect } from "next/navigation";
import { EnhancedAddressManager } from "@/components/account/EnhancedAddressManager";
import { getAuthenticatedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { defaultLocale, isLocale } from "@/i18n/config";

export default async function AddressesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: paramLocale } = await params;
  const locale = isLocale(paramLocale) ? paramLocale : defaultLocale;
  const auth = await getAuthenticatedUser();

  if (!auth) {
    redirect(`/${locale}/auth/login`);
  }

  const addresses = await prisma.address.findMany({
    where: { userId: auth.userId },
    orderBy: { isDefault: "desc" },
  });

  const transformedAddresses = addresses.map(address => ({
    id: address.id,
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    city: address.city,
    district: address.district,
    street: address.street,
    postalCode: address.postalCode || undefined,
    addressLine2: address.addressLine2 || undefined,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString()
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <EnhancedAddressManager
        locale={locale}
        initialAddresses={transformedAddresses}
      />
    </div>
  );
}
