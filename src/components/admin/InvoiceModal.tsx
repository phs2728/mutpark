"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertCircle, User, Building2, Search } from "lucide-react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoiceData: InvoiceFormData) => void;
  invoice?: any | null;
}

interface InvoiceFormData {
  orderId: number | "";
  tckn: string;
  vkn: string;
  taxOffice: string;
  companyName: string;
  companyAddress: string;
  customerName: string;
  customerAddress: string;
}

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  customer: {
    name: string;
    email: string;
    address?: string;
  };
}

export default function InvoiceModal({
  isOpen,
  onClose,
  onSave,
  invoice
}: InvoiceModalProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    orderId: "",
    tckn: "",
    vkn: "",
    taxOffice: "",
    companyName: "",
    companyAddress: "",
    customerName: "",
    customerAddress: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showOrderSearch, setShowOrderSearch] = useState(false);
  const [customerType, setCustomerType] = useState<"individual" | "company">("individual");

  useEffect(() => {
    if (invoice) {
      setFormData({
        orderId: invoice.orderId,
        tckn: invoice.tckn || "",
        vkn: invoice.vkn || "",
        taxOffice: invoice.taxOffice || "",
        companyName: invoice.companyName || "",
        companyAddress: invoice.companyAddress || "",
        customerName: invoice.customerName || "",
        customerAddress: invoice.customerAddress || "",
      });
      setCustomerType(invoice.vkn ? "company" : "individual");
    } else {
      setFormData({
        orderId: "",
        tckn: "",
        vkn: "",
        taxOffice: "",
        companyName: "",
        companyAddress: "",
        customerName: "",
        customerAddress: "",
      });
      setCustomerType("individual");
    }
    setErrors({});
  }, [invoice, isOpen]);

  const searchOrders = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoadingOrders(true);
      const response = await fetch(`/api/admin/orders?search=${encodeURIComponent(searchTerm)}&status=COMPLETED`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error searching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const selectOrder = (order: Order) => {
    setFormData({
      ...formData,
      orderId: order.id,
      customerName: order.customer.name,
      customerAddress: order.customer.address || "",
    });
    setShowOrderSearch(false);
    setSearchTerm("");
    setOrders([]);
  };

  const validateTCKN = (tckn: string): boolean => {
    if (!/^\d{11}$/.test(tckn)) return false;

    const digits = tckn.split('').map(Number);

    // First digit cannot be 0
    if (digits[0] === 0) return false;

    // Calculate checksum
    const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const sumEven = digits[1] + digits[3] + digits[5] + digits[7];

    const check10 = ((sumOdd * 7) - sumEven) % 10;
    if (check10 !== digits[9]) return false;

    const check11 = (digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0)) % 10;
    if (check11 !== digits[10]) return false;

    return true;
  };

  const validateVKN = (vkn: string): boolean => {
    if (!/^\d{10}$/.test(vkn)) return false;

    const digits = vkn.split('').map(Number);
    const weights = [9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += digits[i] * weights[i];
    }

    const remainder = sum % 11;
    let checkDigit;

    if (remainder < 2) {
      checkDigit = remainder;
    } else {
      checkDigit = 11 - remainder;
    }

    return checkDigit === digits[9];
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderId) {
      newErrors.orderId = "주문을 선택해주세요";
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = "고객명을 입력해주세요";
    }

    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = "고객 주소를 입력해주세요";
    }

    if (customerType === "individual") {
      if (!formData.tckn.trim()) {
        newErrors.tckn = "TCKN을 입력해주세요";
      } else if (!validateTCKN(formData.tckn)) {
        newErrors.tckn = "올바른 TCKN을 입력해주세요";
      }
    } else {
      if (!formData.vkn.trim()) {
        newErrors.vkn = "VKN을 입력해주세요";
      } else if (!validateVKN(formData.vkn)) {
        newErrors.vkn = "올바른 VKN을 입력해주세요";
      }

      if (!formData.companyName.trim()) {
        newErrors.companyName = "회사명을 입력해주세요";
      }

      if (!formData.taxOffice.trim()) {
        newErrors.taxOffice = "세무서를 입력해주세요";
      }
    }

    if (!formData.companyAddress.trim()) {
      newErrors.companyAddress = "회사 주소를 입력해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const invoiceData = {
        ...formData,
        tckn: customerType === "individual" ? formData.tckn : "",
        vkn: customerType === "company" ? formData.vkn : "",
        companyName: customerType === "company" ? formData.companyName : "",
        taxOffice: customerType === "company" ? formData.taxOffice : "",
      };

      onSave(invoiceData);
    } catch (error) {
      console.error("Invoice save error:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {invoice ? "세금계산서 수정" : "새 세금계산서 생성"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Selection */}
          {!invoice && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주문 선택 *
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="주문번호 또는 고객명으로 검색..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={searchOrders}
                    disabled={loadingOrders}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>

                {orders.length > 0 && (
                  <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                    {orders.map((order) => (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => selectOrder(order)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-gray-600">
                          {order.customer.name} - {new Intl.NumberFormat("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                          }).format(order.totalAmount)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {formData.orderId && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="text-sm text-green-800">
                      선택된 주문: #{formData.orderId}
                    </div>
                  </div>
                )}
              </div>
              {errors.orderId && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.orderId}
                </p>
              )}
            </div>
          )}

          {/* Customer Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              고객 유형 *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="individual"
                  checked={customerType === "individual"}
                  onChange={(e) => setCustomerType(e.target.value as "individual" | "company")}
                  className="mr-2"
                />
                <User className="h-4 w-4 mr-1" />
                개인
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="company"
                  checked={customerType === "company"}
                  onChange={(e) => setCustomerType(e.target.value as "individual" | "company")}
                  className="mr-2"
                />
                <Building2 className="h-4 w-4 mr-1" />
                법인
              </label>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                고객명 *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.customerName ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="고객 이름"
              />
              {errors.customerName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.customerName}
                </p>
              )}
            </div>

            {customerType === "company" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사명 *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.companyName ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="회사명"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.companyName}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tax Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerType === "individual" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TCKN (터키 개인 세번호) *
                </label>
                <input
                  type="text"
                  value={formData.tckn}
                  onChange={(e) => setFormData({ ...formData, tckn: e.target.value.replace(/\D/g, '') })}
                  maxLength={11}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.tckn ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="12345678901"
                />
                {errors.tckn && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.tckn}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VKN (터키 법인 세번호) *
                  </label>
                  <input
                    type="text"
                    value={formData.vkn}
                    onChange={(e) => setFormData({ ...formData, vkn: e.target.value.replace(/\D/g, '') })}
                    maxLength={10}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.vkn ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="1234567890"
                  />
                  {errors.vkn && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.vkn}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    세무서 *
                  </label>
                  <input
                    type="text"
                    value={formData.taxOffice}
                    onChange={(e) => setFormData({ ...formData, taxOffice: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.taxOffice ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="세무서명"
                  />
                  {errors.taxOffice && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.taxOffice}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Addresses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              고객 주소 *
            </label>
            <textarea
              value={formData.customerAddress}
              onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.customerAddress ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="고객 주소"
            />
            {errors.customerAddress && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.customerAddress}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              회사 주소 *
            </label>
            <textarea
              value={formData.companyAddress}
              onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.companyAddress ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="회사 주소"
            />
            {errors.companyAddress && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.companyAddress}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {invoice ? "수정" : "생성"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}