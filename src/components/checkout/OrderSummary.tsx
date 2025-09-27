"use client";

import { useI18n } from "@/providers/I18nProvider";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";
import type { PaymentMethod } from "./PaymentMethodSelector";

interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface OrderSummaryProps {
  items: OrderItem[];
  locale: string;
  paymentMethod: PaymentMethod | null;
  installmentMonths?: number;
  shippingCost: number;
  appliedDiscount?: {
    amount: number;
    type: "percentage" | "fixed";
    code: string;
  };
}

// Turkish tax rates
const TAX_RATES = {
  KDV_18: 0.18, // Standard VAT rate in Turkey
  KDV_8: 0.08,  // Reduced VAT rate for basic necessities
  KDV_1: 0.01   // Super reduced VAT rate for certain products
};

// Function to determine tax rate based on product category
const getTaxRate = (productName: string): number => {
  const lowerName = productName.toLowerCase();

  // Basic food items get reduced VAT
  if (lowerName.includes('ekmek') || lowerName.includes('süt') || lowerName.includes('et') ||
      lowerName.includes('sebze') || lowerName.includes('meyve')) {
    return TAX_RATES.KDV_8;
  }

  // Most other products get standard VAT
  return TAX_RATES.KDV_18;
};

export function OrderSummary({
  items,
  locale,
  paymentMethod,
  installmentMonths,
  shippingCost,
  appliedDiscount
}: OrderSummaryProps) {
  const { t } = useI18n();

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Calculate taxes per item
  const itemsWithTax = items.map(item => {
    const taxRate = getTaxRate(item.name);
    const itemTotal = item.price * item.quantity;
    const taxAmount = itemTotal * taxRate;

    return {
      ...item,
      taxRate,
      taxAmount,
      totalWithoutTax: itemTotal / (1 + taxRate), // Assuming prices include tax
      totalWithTax: itemTotal
    };
  });

  // Calculate total tax
  const totalTax = itemsWithTax.reduce((sum, item) => sum + item.taxAmount, 0);

  // Calculate total without tax (for display purposes)
  const subtotalWithoutTax = itemsWithTax.reduce((sum, item) => sum + item.totalWithoutTax, 0);

  // Apply discount
  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === "percentage") {
      discountAmount = subtotal * (appliedDiscount.amount / 100);
    } else {
      discountAmount = appliedDiscount.amount;
    }
  }

  // Calculate installment fee if applicable
  let installmentFee = 0;
  const installmentFeeRate = installmentMonths ?
    installmentMonths <= 3 ? 0.02 :
    installmentMonths <= 6 ? 0.05 :
    installmentMonths <= 9 ? 0.07 : 0.09 : 0;

  if (paymentMethod === "installment" && installmentMonths) {
    installmentFee = (subtotal - discountAmount) * installmentFeeRate;
  }

  // Final total
  const finalTotal = subtotal - discountAmount + shippingCost + installmentFee;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        📋 {t("checkout.orderSummary.title", "Sipariş Özeti")}
      </h3>

      {/* Order Items */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("checkout.orderSummary.items", "Ürünler")} ({items.length})
        </h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {itemsWithTax.map((item) => (
            <div key={item.productId} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(item.price, DEFAULT_CURRENCY, locale)} × {item.quantity}
                </p>
                <p className="text-xs text-gray-400">
                  KDV: %{(item.taxRate * 100).toFixed(0)} ({formatCurrency(item.taxAmount, DEFAULT_CURRENCY, locale)})
                </p>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(item.totalWithTax, DEFAULT_CURRENCY, locale)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Breakdown */}
      <div className="space-y-3 border-t pt-4">
        {/* Subtotal without tax */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {t("checkout.orderSummary.subtotalWithoutTax", "Ara Toplam (KDV Hariç)")}
          </span>
          <span className="text-gray-900 dark:text-white">
            {formatCurrency(subtotalWithoutTax, DEFAULT_CURRENCY, locale)}
          </span>
        </div>

        {/* Total tax */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {t("checkout.orderSummary.totalTax", "Toplam KDV")}
          </span>
          <span className="text-gray-900 dark:text-white">
            {formatCurrency(totalTax, DEFAULT_CURRENCY, locale)}
          </span>
        </div>

        {/* Subtotal with tax */}
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-gray-700 dark:text-gray-300">
            {t("checkout.orderSummary.subtotal", "Ara Toplam")}
          </span>
          <span className="text-gray-900 dark:text-white">
            {formatCurrency(subtotal, DEFAULT_CURRENCY, locale)}
          </span>
        </div>

        {/* Discount */}
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm text-emerald-600">
            <span>
              {t("checkout.orderSummary.discount", "İndirim")} ({appliedDiscount?.code})
            </span>
            <span>
              -{formatCurrency(discountAmount, DEFAULT_CURRENCY, locale)}
            </span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {t("checkout.orderSummary.shipping", "Kargo")}
          </span>
          <span className="text-gray-900 dark:text-white">
            {shippingCost === 0 ? (
              <span className="text-emerald-600 font-medium">
                {t("checkout.orderSummary.freeShipping", "Ücretsiz")}
              </span>
            ) : (
              formatCurrency(shippingCost, DEFAULT_CURRENCY, locale)
            )}
          </span>
        </div>

        {/* Installment fee */}
        {installmentFee > 0 && (
          <div className="flex items-center justify-between text-sm text-orange-600">
            <span>
              {t("checkout.orderSummary.installmentFee", "Taksit Komisyonu")} (%{(installmentFeeRate * 100).toFixed(0)})
            </span>
            <span>
              +{formatCurrency(installmentFee, DEFAULT_CURRENCY, locale)}
            </span>
          </div>
        )}

        {/* Final Total */}
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("checkout.orderSummary.total", "Toplam Tutar")}
          </span>
          <span className="text-xl font-bold text-emerald-600">
            {formatCurrency(finalTotal, DEFAULT_CURRENCY, locale)}
          </span>
        </div>

        {/* Installment breakdown */}
        {paymentMethod === "installment" && installmentMonths && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 dark:bg-amber-900/20 dark:border-amber-800">
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                {installmentMonths} {t("checkout.orderSummary.monthlyPayment", "Aylık Ödeme")}
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                {formatCurrency(finalTotal / installmentMonths, DEFAULT_CURRENCY, locale)} × {installmentMonths} {t("checkout.orderSummary.months", "ay")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tax Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 dark:bg-gray-900/50 dark:border-gray-700">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-1">
            {t("checkout.orderSummary.taxInfo", "KDV Bilgileri")}
          </p>
          <p>
            {t("checkout.orderSummary.taxNote", "Fiyatlara KDV dahildir. Fatura kesimi sırasında vergi detayları görüntülenecektir.")}
          </p>
        </div>
      </div>
    </div>
  );
}