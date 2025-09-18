import { redirect } from "next/navigation";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { getAuthenticatedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getLocalizedProduct } from "@/lib/i18n-utils";

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const auth = await getAuthenticatedUser();
  if (!auth) {
    redirect(`/${locale}/auth/login`);
  }

  const [addresses, cartItems] = await Promise.all([
    prisma.address.findMany({
      where: { userId: auth.userId },
      orderBy: { isDefault: "desc" },
    }),
    prisma.cartItem.findMany({
      where: { userId: auth.userId },
      include: {
        product: {
          include: { translations: true },
        },
      },
    }),
  ]);

  if (cartItems.length === 0) {
    redirect(`/${locale}/cart`);
  }

  return (
    <CheckoutClient
      locale={locale}
      addresses={addresses.map((address) => ({
        id: address.id,
        recipientName: address.recipientName,
        phone: address.phone,
        city: address.city,
        district: address.district,
        street: address.street,
        isDefault: address.isDefault,
      }))}
      items={cartItems.map((item) => {
        const product = getLocalizedProduct(item.product!, locale);
        return {
          id: item.id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
          currency: product.currency,
        };
      })}
    />
  );
}
