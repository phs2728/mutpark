"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/providers/I18nProvider";

interface CheckoutAddress {
  id: number;
  recipientName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  isDefault: boolean;
}

interface CheckoutItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  currency: string;
}

export function CheckoutClient({
  locale,
  addresses,
  items,
}: {
  locale: string;
  addresses: CheckoutAddress[];
  items: CheckoutItem[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState(() =>
    addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? 0,
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedAddress) {
      setError(t("checkout.selectAddress"));
      return;
    }
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: selectedAddress, notes }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message ?? "Order failed");
      }
      const orderId = json.data?.id ?? json.data?.order?.id ?? json.data?.orderId;
      if (orderId) {
        const checkoutResponse = await fetch("/api/payment/iyzico/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const checkoutJson = await checkoutResponse.json();
        if (checkoutResponse.ok && checkoutJson.data?.redirectUrl) {
          window.location.href = checkoutJson.data.redirectUrl;
          return;
        }
      }
      router.push(`/${locale}/account/orders`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("checkout.address")}
            </h2>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/account/addresses`)}
              className="text-sm font-semibold text-emerald-600"
            >
              + {t("checkout.addAddress")}
            </button>
          </header>
          <div className="flex flex-col gap-3">
            {addresses.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">
                {t("checkout.selectAddress")}
              </p>
            ) : (
              addresses.map((address) => (
                <label
                  key={address.id}
                  className={`flex cursor-pointer flex-col gap-1 rounded-2xl border px-4 py-3 text-sm transition ${
                    selectedAddress === address.id
                      ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900/20"
                      : "border-slate-200 hover:border-emerald-300 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping-address"
                      checked={selectedAddress === address.id}
                      onChange={() => setSelectedAddress(address.id)}
                    />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {address.recipientName}
                    </span>
                    {address.isDefault ? (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="text-slate-500 dark:text-slate-300">
                    {address.city} {address.district} {address.street}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500">{address.phone}</p>
                </label>
              ))
            )}
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t("checkout.notes")}</h2>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
          />
        </section>
      </div>
      <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t("checkout.payment")}</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-semibold">
                {(item.price * item.quantity).toLocaleString(undefined, {
                  style: "currency",
                  currency: item.currency,
                  minimumFractionDigits: 0,
                })}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-white">
          <span>{t("cart.subtotal")}</span>
          <span>
            {subtotal.toLocaleString(undefined, {
              style: "currency",
              currency: items[0]?.currency ?? "TRY",
              minimumFractionDigits: 0,
            })}
          </span>
        </div>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || !selectedAddress}
          className="w-full rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {loading ? "..." : t("checkout.placeOrder")}
        </button>
      </aside>
    </form>
  );
}
