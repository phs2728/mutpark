import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/session";
import { getLocalizedProduct } from "@/lib/i18n-utils";

interface PaparaPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function PaparaInstructionsPage({ params }: PaparaPageProps) {
  const { locale, id } = await params;
  const auth = await getAuthenticatedUser();
  if (!auth) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: { id: Number(id), userId: auth.userId },
    include: {
      payment: true,
      items: {
        include: {
          product: {
            include: { translations: true },
          },
        },
      },
    },
  });

  if (!order || !order.payment || order.payment.provider !== "papara") {
    notFound();
  }

  const localizedItems = order.items.map((item) => {
    const product = item.product ? getLocalizedProduct(item.product, locale) : null;
    return {
      id: item.id,
      name: product?.name ?? item.productName,
      quantity: item.quantity,
      price: product?.price ?? item.unitPrice.toNumber(),
      currency: product?.currency ?? item.currency,
    };
  });

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Papara Payment</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Order <span className="font-semibold">#{order.orderNumber}</span> has been received. Complete the payment using the details below so that we can start preparing your shipment.
      </p>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="font-medium text-slate-800 dark:text-slate-200">Amount Due</p>
        <p className="text-lg font-semibold text-emerald-600">
          {order.totalAmount.toNumber().toLocaleString(locale, {
            style: "currency",
            currency: order.currency,
            minimumFractionDigits: 0,
          })}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-700">
          <p className="font-medium text-slate-800 dark:text-slate-200">Papara Account</p>
          <p className="text-slate-600 dark:text-slate-300">MutPark</p>
          <p className="font-semibold text-slate-900 dark:text-white">1234567890</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-700">
          <p className="font-medium text-slate-800 dark:text-slate-200">Reference Code</p>
          <p className="text-slate-600 dark:text-slate-300">Please include this in your transfer note.</p>
          <p className="font-semibold text-slate-900 dark:text-white">{order.orderNumber}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-200">
        Transfers are reviewed within 12 hours. You’ll receive an email once we confirm the payment and move the order to Processing.
      </div>
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Order Summary</h2>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {localizedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>
                  {(item.price * item.quantity).toLocaleString(locale, {
                    style: "currency",
                    currency: item.currency,
                    minimumFractionDigits: 0,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/account/orders/${order.id}`}
          className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200"
        >
          View Order
        </Link>
        <Link
          href={`/${locale}/support`}
          className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Need Help?
        </Link>
      </div>
    </div>
  );
}
