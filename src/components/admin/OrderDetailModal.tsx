"use client";

import { useState, useEffect } from "react";
import {
  X,
  Package,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail,
  Calendar,
  Truck,
  Edit,
  Save,
  FileText,
  Download,
  ExternalLink
} from "lucide-react";

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  notes?: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  address: {
    recipientName: string;
    phone: string;
    city: string;
    district: string;
    street: string;
    postalCode?: string;
    addressLine2?: string;
  };
  items: Array<{
    id: number;
    quantity: number;
    unitPrice: number;
    productName: string;
    product: {
      id: number;
      baseName: string;
      imageUrl?: string;
      sku: string;
      translations?: any[];
    };
  }>;
  payment?: {
    id: number;
    provider: string;
    status: string;
    amount: number;
    transactionId?: string;
    createdAt: string;
  };
  taxInvoice?: {
    id: number;
    invoiceNumber: string;
    status: string;
    pdfUrl?: string;
  };
  shippingTracking?: {
    id: number;
    trackingNumber: string;
    status: string;
    currentLocation?: string;
    estimatedDelivery?: string;
    provider: {
      name: string;
      code: string;
    };
  };
}

interface OrderDetailModalProps {
  orderId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdate?: (order: Order) => void;
}

const statusOptions = [
  { value: "PENDING", label: "대기중", color: "bg-yellow-100 text-yellow-800" },
  { value: "AWAITING_PAYMENT", label: "결제대기", color: "bg-orange-100 text-orange-800" },
  { value: "PAID", label: "결제완료", color: "bg-blue-100 text-blue-800" },
  { value: "PROCESSING", label: "처리중", color: "bg-purple-100 text-purple-800" },
  { value: "SHIPPED", label: "배송중", color: "bg-indigo-100 text-indigo-800" },
  { value: "DELIVERED", label: "배송완료", color: "bg-green-100 text-green-800" },
  { value: "CANCELLED", label: "취소됨", color: "bg-red-100 text-red-800" },
];

export default function OrderDetailModal({ orderId, isOpen, onClose, onOrderUpdate }: OrderDetailModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    trackingNumber: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetail = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch order detail");
      }

      const data = await response.json();
      setOrder(data.order);
      setEditForm({
        status: data.order.status,
        trackingNumber: data.order.trackingNumber || "",
        notes: data.order.notes || "",
      });
    } catch (error) {
      console.error("Error fetching order detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!order) return;

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const data = await response.json();
      setOrder(data.order);
      setIsEditing(false);

      if (onOrderUpdate) {
        onOrderUpdate(data.order);
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR");
  };

  const getStatusConfig = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">주문 상세 정보</h2>
            {order && (
              <p className="text-sm text-gray-500">주문번호: {order.orderNumber}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {order && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                편집
              </button>
            )}
            {isEditing && (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ) : order ? (
            <div className="p-6 space-y-6">
              {/* Status and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">주문 상태</h3>
                  <div className="space-y-3">
                    {isEditing ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          상태
                        </label>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusConfig(order.status).color}`}>
                          {getStatusConfig(order.status).label}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      주문일시: {formatDate(order.createdAt)}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-2" />
                      총 {order.items.length}개 상품
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">고객 정보</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{order.user.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{order.user.email}</span>
                    </div>
                    {order.user.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{order.user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">배송 정보</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{order.address.recipientName}</p>
                      <p className="text-sm text-gray-600">{order.address.phone}</p>
                      <p className="text-sm text-gray-700 mt-1">
                        {order.address.street}, {order.address.district}, {order.address.city}
                        {order.address.postalCode && ` ${order.address.postalCode}`}
                      </p>
                      {order.address.addressLine2 && (
                        <p className="text-sm text-gray-600">{order.address.addressLine2}</p>
                      )}
                    </div>
                  </div>

                  {/* Tracking Information */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {isEditing ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          운송장 번호
                        </label>
                        <input
                          type="text"
                          value={editForm.trackingNumber}
                          onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="운송장 번호를 입력하세요"
                        />
                      </div>
                    ) : order.trackingNumber ? (
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium">운송장: {order.trackingNumber}</span>
                        <button className="ml-2 text-blue-600 hover:text-blue-800">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">운송장 번호가 등록되지 않음</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">주문 상품</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                      {item.product.imageUrl && (
                        <img
                          src={item.product.imageUrl}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg mr-4"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">
                            수량: {item.quantity}개
                          </span>
                          <span className="font-medium">
                            {formatCurrency(Number(item.unitPrice) * item.quantity, order.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              {order.payment && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">결제 정보</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-3 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.payment.provider} - {order.payment.status}
                        </p>
                        <p className="text-sm text-gray-600">
                          결제 금액: {formatCurrency(Number(order.payment.amount), order.currency)}
                        </p>
                        {order.payment.transactionId && (
                          <p className="text-sm text-gray-500">
                            거래 ID: {order.payment.transactionId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tax Invoice */}
              {order.taxInvoice && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">세금계산서</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            계산서 번호: {order.taxInvoice.invoiceNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            상태: {order.taxInvoice.status}
                          </p>
                        </div>
                      </div>
                      {order.taxInvoice.pdfUrl && (
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          <Download className="h-4 w-4 mr-2" />
                          PDF 다운로드
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">관리자 메모</h3>
                {isEditing ? (
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="관리자 메모를 입력하세요..."
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      {order.notes || "메모가 없습니다."}
                    </p>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">총 결제 금액</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(Number(order.totalAmount), order.currency)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              주문 정보를 불러올 수 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}