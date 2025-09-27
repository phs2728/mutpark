"use client";

import { useState } from "react";
import { useI18n } from "@/providers/I18nProvider";

export type PaymentMethod = "credit_card" | "iyzico" | "installment" | "bank_transfer";

interface PaymentMethodSelectorProps {
  onPaymentMethodChange: (method: PaymentMethod, installmentOption?: number) => void;
  selectedMethod: PaymentMethod | null;
  orderTotal: number;
}

const INSTALLMENT_OPTIONS = [
  { months: 2, feeRate: 0.02 },
  { months: 3, feeRate: 0.03 },
  { months: 6, feeRate: 0.05 },
  { months: 9, feeRate: 0.07 },
  { months: 12, feeRate: 0.09 }
];

export function PaymentMethodSelector({
  onPaymentMethodChange,
  selectedMethod,
  orderTotal
}: PaymentMethodSelectorProps) {
  const { t } = useI18n();
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);

  const handleMethodSelect = (method: PaymentMethod) => {
    if (method === "installment" && selectedInstallment) {
      onPaymentMethodChange(method, selectedInstallment);
    } else {
      onPaymentMethodChange(method);
      if (method !== "installment") {
        setSelectedInstallment(null);
      }
    }
  };

  const handleInstallmentSelect = (months: number) => {
    setSelectedInstallment(months);
    onPaymentMethodChange("installment", months);
  };

  const calculateInstallmentAmount = (months: number, feeRate: number) => {
    const totalWithFee = orderTotal * (1 + feeRate);
    return totalWithFee / months;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        💳 {t("checkout.payment.title", "Ödeme Yöntemi")}
      </h3>

      <div className="space-y-4">
        {/* Credit Card */}
        <label className="block">
          <input
            type="radio"
            name="paymentMethod"
            value="credit_card"
            checked={selectedMethod === "credit_card"}
            onChange={() => handleMethodSelect("credit_card")}
            className="sr-only"
          />
          <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === "credit_card"
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
              : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
          }`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">💳</div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {t("checkout.payment.creditCard", "Kredi Kartı")}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("checkout.payment.creditCardDesc", "Visa, Mastercard, American Express")}
                </p>
              </div>
              <div className="ml-auto">
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedMethod === "credit_card"
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-300"
                }`}>
                  {selectedMethod === "credit_card" && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </label>

        {/* Iyzico */}
        <label className="block">
          <input
            type="radio"
            name="paymentMethod"
            value="iyzico"
            checked={selectedMethod === "iyzico"}
            onChange={() => handleMethodSelect("iyzico")}
            className="sr-only"
          />
          <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === "iyzico"
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
              : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
          }`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">🛡️</div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {t("checkout.payment.iyzico", "Iyzico Güvenli Ödeme")}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("checkout.payment.iyzicoDesc", "3D Secure ile güvenli ödeme")}
                </p>
              </div>
              <div className="ml-auto">
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedMethod === "iyzico"
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-300"
                }`}>
                  {selectedMethod === "iyzico" && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </label>

        {/* Installment Payment */}
        <label className="block">
          <input
            type="radio"
            name="paymentMethod"
            value="installment"
            checked={selectedMethod === "installment"}
            onChange={() => handleMethodSelect("installment")}
            className="sr-only"
          />
          <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === "installment"
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
              : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
          }`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">📅</div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {t("checkout.payment.installment", "Taksitli Ödeme")}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("checkout.payment.installmentDesc", "2-12 ay arası taksit seçenekleri")}
                </p>
              </div>
              <div className="ml-auto">
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedMethod === "installment"
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-300"
                }`}>
                  {selectedMethod === "installment" && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Installment Options */}
            {selectedMethod === "installment" && (
              <div className="mt-4 pl-8 space-y-2">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("checkout.payment.selectInstallment", "Taksit Seçimi")}
                </h5>
                <div className="grid gap-2">
                  {INSTALLMENT_OPTIONS.map(({ months, feeRate }) => {
                    const monthlyAmount = calculateInstallmentAmount(months, feeRate);
                    const totalWithFee = orderTotal * (1 + feeRate);

                    return (
                      <label key={months} className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <input
                          type="radio"
                          name="installmentOption"
                          value={months}
                          checked={selectedInstallment === months}
                          onChange={() => handleInstallmentSelect(months)}
                          className="mr-2"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            {months} {t("checkout.payment.months", "ay")}
                          </span>
                          <div className="text-xs text-gray-500">
                            {monthlyAmount.toFixed(2)} ₺ × {months} {t("checkout.payment.months", "ay")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {totalWithFee.toFixed(2)} ₺
                          </div>
                          <div className="text-xs text-orange-600">
                            +{(feeRate * 100).toFixed(0)}% {t("checkout.payment.fee", "komisyon")}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </label>

        {/* Bank Transfer */}
        <label className="block">
          <input
            type="radio"
            name="paymentMethod"
            value="bank_transfer"
            checked={selectedMethod === "bank_transfer"}
            onChange={() => handleMethodSelect("bank_transfer")}
            className="sr-only"
          />
          <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === "bank_transfer"
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
              : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
          }`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏦</div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {t("checkout.payment.bankTransfer", "Banka Havalesi")}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("checkout.payment.bankTransferDesc", "EFT/Havale ile ödeme (1-2 iş günü)")}
                </p>
              </div>
              <div className="ml-auto">
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedMethod === "bank_transfer"
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-300"
                }`}>
                  {selectedMethod === "bank_transfer" && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </label>
      </div>

      {/* Payment Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <span className="text-blue-600">🔒</span>
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200">
              {t("checkout.payment.securityTitle", "Güvenli Ödeme")}
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              {t("checkout.payment.securityDesc", "Tüm ödemeleriniz SSL sertifikası ile korunmaktadır. Kart bilgileriniz saklanmaz.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}