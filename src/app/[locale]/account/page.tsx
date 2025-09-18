import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/account/LogoutButton";
import { getAuthenticatedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: paramLocale } = await params;
  const locale = isLocale(paramLocale) ? paramLocale : defaultLocale;
  const dictionary = await getDictionary(locale as Locale);
  const auth = getAuthenticatedUser();
  if (!auth) {
    redirect(`/${locale}/auth/login`);
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: {
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const pendingOrders = await prisma.order.count({
    where: {
      userId: user.id,
      status: { in: ["PENDING", "AWAITING_PAYMENT", "PROCESSING"] },
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            {dictionary.account.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">{user.email}</p>
        </div>
        <LogoutButton label={dictionary.account.logout} locale={locale} />
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-300">{dictionary.account.orders}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{user.orders.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-300">{dictionary.account.orderStatus.PENDING}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{pendingOrders}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-300">{dictionary.account.addresses}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{user.addresses.length}</p>
        </div>
      </div>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{dictionary.account.profile}</h2>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>
              <span className="font-semibold">Name:</span> {user.name}
            </p>
            <p>
              <span className="font-semibold">Phone:</span> {user.phone ?? "-"}
            </p>
            <p>
              <span className="font-semibold">Locale:</span> {user.locale}
            </p>
            <p>
              <span className="font-semibold">Currency:</span> {user.currency}
            </p>
          </div>
          <Link
            href={`/${locale}/account/profile`}
            className="inline-flex items-center text-sm font-semibold text-emerald-600"
          >
            {dictionary.account.update}
          </Link>
        </div>
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{dictionary.account.orders}</h2>
          <div className="space-y-2">
            {user.orders.map((order) => (
              <Link
                key={order.id}
                href={`/${locale}/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm hover:border-emerald-300 dark:border-slate-700 dark:hover:border-emerald-500"
              >
                <span>#{order.orderNumber}</span>
                <span className="text-emerald-500">
                  {dictionary.account.orderStatus[order.status as keyof typeof dictionary.account.orderStatus]}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href={`/${locale}/account/orders`}
            className="inline-flex items-center text-sm font-semibold text-emerald-600"
          >
            {dictionary.account.viewAll} →
          </Link>
        </div>
      </section>
    </div>
  );
}
