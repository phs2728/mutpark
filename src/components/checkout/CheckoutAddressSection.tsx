"use client";

import { useState } from "react";
import { EnhancedTurkishAddressForm } from "./EnhancedTurkishAddressForm";

interface AddressData {
  recipientName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  postalCode: string;
  addressLine2?: string;
  isDefault?: boolean;
}

interface CheckoutAddressSectionProps {
  onShippingAddressChange: (address: AddressData) => void;
  onBillingAddressChange: (address: AddressData | null) => void;
  initialShippingAddress?: Partial<AddressData>;
  initialBillingAddress?: Partial<AddressData>;
  showBillingAddress?: boolean;
}

export function CheckoutAddressSection({
  onShippingAddressChange,
  onBillingAddressChange,
  initialShippingAddress,
  initialBillingAddress,
  showBillingAddress = true
}: CheckoutAddressSectionProps) {
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true);
  const [shippingAddress, setShippingAddress] = useState<AddressData | null>(null);

  const handleShippingAddressChange = (address: AddressData) => {
    setShippingAddress(address);
    onShippingAddressChange(address);

    // 배송지와 청구지가 동일한 경우 청구지도 업데이트
    if (billingAddressSameAsShipping) {
      onBillingAddressChange(address);
    }
  };

  const handleBillingAddressChange = (address: AddressData) => {
    onBillingAddressChange(address);
  };

  const handleBillingOptionChange = (isSameAsShipping: boolean) => {
    setBillingAddressSameAsShipping(isSameAsShipping);

    if (isSameAsShipping && shippingAddress) {
      // 배송지와 동일하게 설정
      onBillingAddressChange(shippingAddress);
    } else if (!isSameAsShipping) {
      // 다른 주소 사용 시 청구지 초기화
      onBillingAddressChange(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 배송지 정보 */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
          <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
            🚚 배송지 정보
          </h2>
          <p className="text-blue-700 text-sm mt-1">상품을 받으실 주소를 입력해주세요</p>
        </div>

        <div className="p-6">
          <EnhancedTurkishAddressForm
            onAddressChange={handleShippingAddressChange}
            initialData={initialShippingAddress}
            showTitle={false}
            addressType="shipping"
          />
        </div>
      </div>

      {/* 청구지 정보 */}
      {showBillingAddress && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
            <h2 className="text-xl font-semibold text-green-900 flex items-center gap-2">
              📋 청구지 정보
            </h2>
            <p className="text-green-700 text-sm mt-1">세금계산서를 받으실 주소를 선택해주세요</p>
          </div>

          <div className="p-6">
            <EnhancedTurkishAddressForm
              onAddressChange={handleBillingAddressChange}
              initialData={initialBillingAddress}
              showTitle={false}
              showBillingOption={true}
              addressType="billing"
              onAddressTypeChange={handleBillingOptionChange}
            />
          </div>
        </div>
      )}

      {/* 주소 요약 카드 */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          📍 선택된 주소 요약
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 배송지 요약 */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-1">
              🚚 배송지
            </h4>
            {shippingAddress ? (
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">받는 분:</span> {shippingAddress.recipientName}</p>
                <p><span className="font-medium">연락처:</span> {shippingAddress.phone}</p>
                <p><span className="font-medium">주소:</span> {shippingAddress.city} {shippingAddress.district}</p>
                <p className="text-xs text-gray-600">{shippingAddress.street}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">배송지를 입력해주세요</p>
            )}
          </div>

          {/* 청구지 요약 */}
          {showBillingAddress && (
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-green-900 mb-2 flex items-center gap-1">
                📋 청구지
              </h4>
              {billingAddressSameAsShipping ? (
                <div className="text-sm text-green-700">
                  <p>배송지와 동일</p>
                </div>
              ) : (
                <div className="text-sm text-gray-700">
                  <p>다른 주소 사용</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ 주소를 정확히 입력해주세요. 잘못된 주소로 인한 배송 지연이나 반송은 고객 부담입니다.
          </p>
        </div>
      </div>
    </div>
  );
}