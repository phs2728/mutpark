import { redirect } from "next/navigation";
import { OrderHistory } from "@/components/account/OrderHistory";
import { getAuthenticatedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const auth = await getAuthenticatedUser();

  if (!auth) {
    redirect(`/${locale}/auth/login`);
  }

  // Fetch user orders with product details
  const orders = await prisma.order.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            include: {
              translations: true
            }
          }
        }
      },
      address: true
    }
  });

  // Transform orders for the component
  const transformedOrders = orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: Number(order.totalAmount),
    shippingCost: Number(order.shippingFee),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    trackingNumber: order.trackingNumber || undefined,
    estimatedDelivery: undefined,
    items: order.items.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.translations.find((t: any) => t.language === locale)?.name || item.product.baseName,
      quantity: item.quantity,
      price: Number(item.unitPrice),
      imageUrl: item.product.imageUrl || undefined
    })),
    shippingAddress: order.address ? {
      recipientName: order.address.recipientName,
      phone: order.address.phone,
      city: order.address.city,
      district: order.address.district,
      street: order.address.street
    } : undefined
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderHistory
        locale={locale}
        initialOrders={transformedOrders}
      />
    </div>
  );
}
