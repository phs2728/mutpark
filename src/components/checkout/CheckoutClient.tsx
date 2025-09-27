"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/providers/I18nProvider";
import { EnhancedTurkishAddressForm } from "./EnhancedTurkishAddressForm";
import { PaymentMethodSelector, type PaymentMethod } from "./PaymentMethodSelector";
import { OrderSummary } from "./OrderSummary";
import { ShippingOptions, type ShippingOption } from "./ShippingOptions";
import { OrderTracking } from "./OrderTracking";

interface CheckoutItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  currency: string;
}

interface Address {
  id: number;
  recipientName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  isDefault: boolean;
}

interface CheckoutClientProps {
  locale: string;
  items: CheckoutItem[];
  addresses: Address[];
}

export function CheckoutClient({ locale, items, addresses }: CheckoutClientProps) {
  const router = useRouter();
  const { t } = useI18n();

  // Form state
  const [deliveryAddress, setDeliveryAddress] = useState<{
    recipientName: string;
    phone: string;
    city: string;
    district: string;
    street: string;
    postalCode: string;
    addressLine2?: string;
  } | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [installmentMonths, setInstallmentMonths] = useState<number | undefined>();
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(null);
  const [shippingCost, setShippingCost] = useState(29.99);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Calculate order total
  const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleAddressChange = (address: typeof deliveryAddress) => {
    setDeliveryAddress(address);
  };

  const handlePaymentMethodChange = (method: PaymentMethod, installmentOption?: number) => {
    setPaymentMethod(method);
    setInstallmentMonths(installmentOption);
  };

  const handleShippingChange = (option: ShippingOption, price: number) => {
    setShippingOption(option);
    setShippingCost(price);
  };

  const isFormValid = () => {
    return (
      deliveryAddress &&
      deliveryAddress.recipientName &&
      deliveryAddress.phone &&
      deliveryAddress.city &&
      deliveryAddress.district &&
      deliveryAddress.street &&
      paymentMethod &&
      shippingOption &&
      agreedToTerms
    );
  };

  const handleSubmitOrder = async () => {
    if (!isFormValid()) {
      alert(t("checkout.form.incomplete", "Lütfen tüm alanları doldurun"));
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddress,
        paymentMethod,
        installmentMonths,
        shippingOption,
        shippingCost,
        total: orderTotal + shippingCost
      };

      // Submit order to API
      const response = await fetch(`/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        router.push(`/${locale}/orders/${order.id}/success`);
      } else {
        throw new Error("Order submission failed");
      }
    } catch (error) {
      console.error("Order submission error:", error);
      alert(t("checkout.error.submission", "Sipariş oluşturulurken bir hata oluştu"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          🛒 {t("checkout.title", "Sipariş Tamamla")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t("checkout.subtitle", "Sipariş bilgilerinizi gözden geçirin ve ödemeyi tamamlayın")}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Delivery Address */}
          <div className="card p-6">
            <EnhancedTurkishAddressForm
              onAddressChange={handleAddressChange}
              initialData={addresses[0] ? {
                recipientName: addresses[0].recipientName,
                phone: addresses[0].phone,
                city: addresses[0].city,
                district: addresses[0].district,
                street: addresses[0].street,
                postalCode: (addresses[0] as any).postalCode || "",
                addressLine2: (addresses[0] as any).addressLine2
              } : undefined}
              addressType="shipping"
            />
          </div>

          {/* Shipping Options */}
          <div className="card p-6">
            <ShippingOptions
              onShippingChange={handleShippingChange}
              selectedOption={shippingOption}
              orderTotal={orderTotal}
              locale={locale}
            />
          </div>

          {/* Payment Method */}
          <div className="card p-6">
            <PaymentMethodSelector
              onPaymentMethodChange={handlePaymentMethodChange}
              selectedMethod={paymentMethod}
              orderTotal={orderTotal + shippingCost}
            />
          </div>

          {/* Terms and Conditions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📋 {t("checkout.terms.title", "Koşullar ve Sözleşmeler")}
            </h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t("checkout.terms.agreement", "Ön Bilgilendirme Koşulları, Mesafeli Satış Sözleşmesi ve Gizlilik Politikası'nı okudum, onaylıyorum.")}
                </span>
              </label>

              <div className="flex flex-wrap gap-2 ml-7">
                <a
                  href={`/${locale}/legal/terms`}
                  target="_blank"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  {t("checkout.terms.termsOfService", "Kullanım Koşulları")}
                </a>
                <span className="text-xs text-gray-400">•</span>
                <a
                  href={`/${locale}/legal/privacy`}
                  target="_blank"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  {t("checkout.terms.privacyPolicy", "Gizlilik Politikası")}
                </a>
                <span className="text-xs text-gray-400">•</span>
                <a
                  href={`/${locale}/legal/distance-sales`}
                  target="_blank"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  {t("checkout.terms.distanceSales", "Mesafeli Satış Sözleşmesi")}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Order Summary */}
        <div className="lg:sticky lg:top-8">
          <div className="card p-6">
            <OrderSummary
              items={items.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
              }))}
              locale={locale}
              paymentMethod={paymentMethod}
              installmentMonths={installmentMonths}
              shippingCost={shippingCost}
            />

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={!isFormValid() || isProcessing}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t("checkout.processing", "İşleniyor...")}
                  </span>
                ) : (
                  t("checkout.completeOrder", "Siparişi Tamamla")
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push(`/${locale}/cart`)}
                className="btn-outline w-full"
              >
                {t("checkout.backToCart", "Sepete Dön")}
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3 dark:bg-gray-900/50 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">🔒</span>
                <div className="text-xs">
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {t("checkout.security.title", "Güvenli Alışveriş")}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("checkout.security.description", "256-bit SSL sertifikası ile korunmaktadır")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
