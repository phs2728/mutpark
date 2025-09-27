"use client";

import { useState } from "react";
import { useI18n } from "@/providers/I18nProvider";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

export type ShippingOption = "standard" | "express" | "premium";

interface ShippingMethod {
  id: ShippingOption;
  name: string;
  description: string;
  price: number;
  deliveryTime: string;
  icon: string;
  features: string[];
}

interface ShippingOptionsProps {
  onShippingChange: (option: ShippingOption, price: number) => void;
  selectedOption: ShippingOption | null;
  orderTotal: number;
  locale: string;
  freeShippingThreshold?: number;
}

export function ShippingOptions({
  onShippingChange,
  selectedOption,
  orderTotal,
  locale,
  freeShippingThreshold = 199
}: ShippingOptionsProps) {
  const { t } = useI18n();

  const shippingMethods: ShippingMethod[] = [
    {
      id: "standard",
      name: t("checkout.shipping.standard", "Standart Kargo"),
      description: t("checkout.shipping.standardDesc", "Ekonomik teslimat seçeneği"),
      price: orderTotal >= freeShippingThreshold ? 0 : 29.99,
      deliveryTime: t("checkout.shipping.standardTime", "3-5 iş günü"),
      icon: "📦",
      features: [
        t("checkout.shipping.standardFeature1", "Güvenli paketleme"),
        t("checkout.shipping.standardFeature2", "SMS ile bilgilendirme"),
        t("checkout.shipping.standardFeature3", "Kapıda ödeme mevcut")
      ]
    },
    {
      id: "express",
      name: t("checkout.shipping.express", "Hızlı Kargo"),
      description: t("checkout.shipping.expressDesc", "Öncelikli teslimat"),
      price: 49.99,
      deliveryTime: t("checkout.shipping.expressTime", "1-2 iş günü"),
      icon: "🚀",
      features: [
        t("checkout.shipping.expressFeature1", "Öncelikli işlem"),
        t("checkout.shipping.expressFeature2", "SMS + Email bilgilendirme"),
        t("checkout.shipping.expressFeature3", "Takip numarası"),
        t("checkout.shipping.expressFeature4", "İade garantisi")
      ]
    },
    {
      id: "premium",
      name: t("checkout.shipping.premium", "Premium Teslimat"),
      description: t("checkout.shipping.premiumDesc", "Aynı gün teslimat (İstanbul içi)"),
      price: 79.99,
      deliveryTime: t("checkout.shipping.premiumTime", "Aynı gün"),
      icon: "⚡",
      features: [
        t("checkout.shipping.premiumFeature1", "Aynı gün teslimat"),
        t("checkout.shipping.premiumFeature2", "Canlı takip"),
        t("checkout.shipping.premiumFeature3", "Kurye iletişimi"),
        t("checkout.shipping.premiumFeature4", "Soğuk zincir koruması"),
        t("checkout.shipping.premiumFeature5", "Premium paketleme")
      ]
    }
  ];

  const handleShippingSelect = (option: ShippingOption) => {
    const method = shippingMethods.find(m => m.id === option);
    if (method) {
      onShippingChange(option, method.price);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        🚚 {t("checkout.shipping.title", "Teslimat Seçenekleri")}
      </h3>

      {/* Free shipping notification */}
      {orderTotal >= freeShippingThreshold && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 dark:bg-emerald-900/20 dark:border-emerald-800">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600">🎉</span>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              {t("checkout.shipping.freeShippingEarned", "Tebrikler! Ücretsiz kargo kazandınız!")}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {shippingMethods.map((method) => (
          <label key={method.id} className="block">
            <input
              type="radio"
              name="shippingOption"
              value={method.id}
              checked={selectedOption === method.id}
              onChange={() => handleShippingSelect(method.id)}
              className="sr-only"
            />
            <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedOption === method.id
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}>
              <div className="flex items-start gap-4">
                <div className="text-3xl">{method.icon}</div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {method.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {method.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {method.price === 0 ? (
                          <span className="text-emerald-600">
                            {t("checkout.shipping.free", "Ücretsiz")}
                          </span>
                        ) : (
                          formatCurrency(method.price, DEFAULT_CURRENCY, locale)
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {method.deliveryTime}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-3">
                    {method.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="text-emerald-500">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Special notices */}
                  {method.id === "premium" && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2 dark:bg-yellow-900/20 dark:border-yellow-800">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        ⚠️ {t("checkout.shipping.premiumNotice", "Premium teslimat sadece İstanbul Avrupa yakası için geçerlidir. Sipariş 14:00'dan önce verilmelidir.")}
                      </p>
                    </div>
                  )}

                  {method.id === "express" && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-2 dark:bg-blue-900/20 dark:border-blue-800">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        ℹ️ {t("checkout.shipping.expressNotice", "Hızlı kargo için sipariş 16:00'dan önce verilmelidir.")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-auto">
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    selectedOption === method.id
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300"
                  }`}>
                    {selectedOption === method.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Delivery Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 dark:bg-gray-900/50 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          📍 {t("checkout.shipping.deliveryInfo", "Teslimat Bilgileri")}
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• {t("checkout.shipping.deliveryInfo1", "Teslimat süresi, ürün hazırlama süresini kapsamaz")}</li>
          <li>• {t("checkout.shipping.deliveryInfo2", "Hafta sonu ve resmi tatillerde teslimat yapılmaz")}</li>
          <li>• {t("checkout.shipping.deliveryInfo3", "Kargo firması değişiklik hakkı saklıdır")}</li>
          <li>• {t("checkout.shipping.deliveryInfo4", "Adres bilgileri eksiksiz ve doğru olmalıdır")}</li>
        </ul>
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <span className="text-blue-600">💬</span>
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
              {t("checkout.shipping.contactTitle", "Teslimat Desteği")}
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              {t("checkout.shipping.contactDesc", "Teslimat ile ilgili sorularınız için 0850 XXX XX XX numaralı hattımızdan bize ulaşabilirsiniz.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}