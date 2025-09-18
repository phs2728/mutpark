import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Order, OrderItem, Payment } from "@prisma/client";

type OrderWithDetails = Order & {
  items: OrderItem[];
  payment: Payment | null;
};

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: paramLocale } = await params;
  const locale = isLocale(paramLocale) ? paramLocale : defaultLocale;
  const dictionary = await getDictionary(locale as Locale);
  const auth = await getAuthenticatedUser();
  if (!auth) {
    redirect(`/${locale}/auth/login`);
  }

  const orders = await prisma.order.findMany({
    where: { userId: auth.userId },
    include: {
      items: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{dictionary.account.orders}</h1>
      <div className="space-y-4">
        {orders.map((order: OrderWithDetails) => (
          <div
            key={order.id}
            className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-300">#{order.orderNumber}</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {dictionary.account.orderStatus[order.status as keyof typeof dictionary.account.orderStatus]}
                </p>
              </div>
              <div className="text-right text-sm text-slate-500 dark:text-slate-300">
                <p>
                  {new Date(order.createdAt).toLocaleString(locale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-lg font-semibold text-emerald-600">
                  {Number(order.totalAmount).toLocaleString(undefined, {
                    style: "currency",
                    currency: order.currency,
                    minimumFractionDigits: 0,
                  })}
                </p>
              </div>
            </div>
            <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800">
              {order.items.map((item: OrderItem) => (
                <div key={item.id} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>
                    {Number(item.unitPrice).toLocaleString(undefined, {
                      style: "currency",
                      currency: item.currency,
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
