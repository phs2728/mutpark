"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/providers/I18nProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { isCurrency, type CurrencyCode } from "@/lib/currency";

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
  const { t, locale: activeLocale } = useI18n();
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState(() =>
    addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? 0,
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<"iyzico" | "papara" | "installment">("iyzico");
  const [installmentPlan, setInstallmentPlan] = useState(3);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");

  const { currency: displayCurrency, convert } = useCurrency();

  const subtotalDisplay = items.reduce((acc, item) => {
    const baseCurrency = isCurrency(item.currency) ? item.currency : displayCurrency;
    const converted = convert(item.price * item.quantity, baseCurrency);
    return acc + converted;
  }, 0);

  const subtotalRaw = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const SHIPPING_THRESHOLD = 500;
  const SHIPPING_FEE_STANDARD = 29.9;
  const SHIPPING_FEE_EXPRESS = 49.9;
  const baseCurrency: CurrencyCode = "TRY";
  const freeShipping = subtotalRaw >= SHIPPING_THRESHOLD;
  const shippingFeeValue = freeShipping
    ? 0
    : shippingMethod === "express"
    ? SHIPPING_FEE_EXPRESS
    : SHIPPING_FEE_STANDARD;
  const shippingFeeDisplay = convert(shippingFeeValue, baseCurrency);
  const totalDisplay = subtotalDisplay + shippingFeeDisplay;

  const paymentOptions: Array<{
    id: "iyzico" | "papara" | "installment";
    title: string;
    description: string;
    badge?: string;
  }> = [
    {
      id: "iyzico",
      title: t("checkout.paymentOptions.iyzico.title"),
      description: t("checkout.paymentOptions.iyzico.description"),
      badge: t("checkout.paymentOptions.iyzico.badge"),
    },
    {
      id: "papara",
      title: t("checkout.paymentOptions.papara.title"),
      description: t("checkout.paymentOptions.papara.description"),
    },
    {
      id: "installment",
      title: t("checkout.paymentOptions.installment.title"),
      description: t("checkout.paymentOptions.installment.description"),
    },
  ];

  const shippingOptions: Array<{
    id: "standard" | "express";
    title: string;
    description: string;
    estimate: string;
    fee: number;
  }> = [
    {
      id: "standard",
      title: t("checkout.shipping.options.standard.title"),
      description: t("checkout.shipping.options.standard.description"),
      estimate: t("checkout.shipping.options.standard.estimate"),
      fee: SHIPPING_FEE_STANDARD,
    },
    {
      id: "express",
      title: t("checkout.shipping.options.express.title"),
      description: t("checkout.shipping.options.express.description"),
      estimate: t("checkout.shipping.options.express.estimate"),
      fee: SHIPPING_FEE_EXPRESS,
    },
  ];

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
        body: JSON.stringify({
          addressId: selectedAddress,
          notes,
          paymentMethod,
          installmentPlan: paymentMethod === "installment" ? installmentPlan : undefined,
          shippingMethod,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message ?? "Order failed");
      }
      const orderId = json.data?.id ?? json.data?.order?.id ?? json.data?.orderId;
      if (orderId) {
        if (paymentMethod === "iyzico") {
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
        } else if (paymentMethod === "papara") {
          router.push(`/${locale}/account/orders?payment=papara&order=${orderId}`);
          return;
        } else if (paymentMethod === "installment") {
          router.push(
            `/${locale}/account/orders?payment=installment&plan=${installmentPlan}&order=${orderId}`,
          );
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
        <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t("checkout.shipping.title")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            {t("checkout.shipping.freeThreshold", { amount: SHIPPING_THRESHOLD })}
          </p>
          <div className="flex flex-col gap-3">
            {shippingOptions.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer flex-col gap-1 rounded-2xl border px-4 py-3 text-sm transition ${
                  shippingMethod === option.id
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900/20"
                    : "border-slate-200 hover:border-emerald-300 dark:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping-method"
                      checked={shippingMethod === option.id}
                      onChange={() => setShippingMethod(option.id)}
                    />
                    <span className="font-semibold text-slate-900 dark:text-white">{option.title}</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-300">{option.estimate}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300">{option.description}</p>
                {!freeShipping ? (
                  <p className="text-xs font-semibold text-emerald-600">
                    {convert(option.fee, baseCurrency).toLocaleString(activeLocale, {
                      style: "currency",
                      currency: displayCurrency,
                      minimumFractionDigits: 0,
                    })}
                  </p>
                ) : null}
              </label>
            ))}
          </div>
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
                {(() => {
                  const baseCurrency = isCurrency(item.currency) ? item.currency : displayCurrency;
                  const value = convert(item.price * item.quantity, baseCurrency);
                  return value.toLocaleString(activeLocale, {
                    style: "currency",
                    currency: displayCurrency,
                    minimumFractionDigits: 0,
                  });
                })()}
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {t("checkout.paymentOptions.title")}
          </p>
          <div className="flex flex-col gap-3">
            {paymentOptions.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer flex-col gap-1 rounded-2xl border px-4 py-3 text-sm transition ${
                  paymentMethod === option.id
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900/20"
                    : "border-slate-200 hover:border-emerald-300 dark:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === option.id}
                      onChange={() => setPaymentMethod(option.id)}
                    />
                    <span className="font-semibold text-slate-900 dark:text-white">{option.title}</span>
                  </div>
                  {option.badge ? (
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                      {option.badge}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300">{option.description}</p>
                {option.id === "installment" && paymentMethod === "installment" ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {[3, 6, 9, 12].map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setInstallmentPlan(plan)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          installmentPlan === plan
                            ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-400 dark:bg-emerald-900/30"
                            : "border-slate-200 text-slate-500 hover:border-emerald-300 dark:border-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {plan} {t("checkout.paymentOptions.installment.months")}
                      </button>
                    ))}
                  </div>
                ) : null}
                {option.id === "papara" && paymentMethod === "papara" ? (
                  <p className="text-xs italic text-slate-500 dark:text-slate-400">
                    {t("checkout.paymentOptions.papara.note")}
                  </p>
                ) : null}
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-white">
          <span>{t("cart.subtotal")}</span>
          <span>
            {subtotalDisplay.toLocaleString(activeLocale, {
              style: "currency",
              currency: displayCurrency,
              minimumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
          <span>{t("checkout.shipping.label")}</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {shippingFeeValue === 0
              ? t("checkout.shipping.free")
              : shippingFeeDisplay.toLocaleString(activeLocale, {
                  style: "currency",
                  currency: displayCurrency,
                  minimumFractionDigits: 0,
                })}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-white">
          <span>{t("checkout.total")}</span>
          <span>
            {totalDisplay.toLocaleString(activeLocale, {
              style: "currency",
              currency: displayCurrency,
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
