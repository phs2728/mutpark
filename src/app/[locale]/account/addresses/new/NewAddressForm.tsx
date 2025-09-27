"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EnhancedTurkishAddressForm } from "@/components/checkout/EnhancedTurkishAddressForm";
import Link from "next/link";

interface NewAddressFormProps {
  locale: string;
}

export function NewAddressForm({ locale }: NewAddressFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAddressData, setCurrentAddressData] = useState<{
    recipientName: string;
    phone: string;
    city: string;
    district: string;
    street: string;
    postalCode: string;
    addressLine2?: string;
    isDefault?: boolean;
  } | null>(null);

  const handleAddressChange = (addressData: {
    recipientName: string;
    phone: string;
    city: string;
    district: string;
    street: string;
    postalCode: string;
    addressLine2?: string;
    isDefault?: boolean;
  }) => {
    setCurrentAddressData(addressData);
  };

  const handleSubmit = async () => {
    if (!currentAddressData || isSubmitting) return;

    // Validate required fields
    if (!currentAddressData.recipientName || !currentAddressData.phone ||
        !currentAddressData.city || !currentAddressData.district || !currentAddressData.street) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentAddressData),
        credentials: 'include',
      });

      if (response.ok) {
        router.push(`/${locale}/account/addresses`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save address:', errorData);
        alert('주소 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('주소 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = currentAddressData?.recipientName &&
                     currentAddressData?.phone &&
                     currentAddressData?.city &&
                     currentAddressData?.district &&
                     currentAddressData?.street;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/${locale}/account/addresses`}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← 배송지 목록으로 돌아가기
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">새 배송지 추가</h1>
          <p className="text-gray-600 mt-2">
            새로운 배송지 정보를 입력해주세요. 모든 필수 항목을 정확히 작성해주시기 바랍니다.
          </p>
        </div>

        {/* Address Form */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <EnhancedTurkishAddressForm
            onAddressChange={handleAddressChange}
            showTitle={false}
            addressType="shipping"
          />

          {/* Custom Submit Button */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  저장 중...
                </div>
              ) : (
                '배송지 저장하기'
              )}
            </button>

            <Link
              href={`/${locale}/account/addresses`}
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-center font-medium min-w-[120px]"
            >
              취소
            </Link>
          </div>
        </div>

        {/* Enhanced Help Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              📋 배송지 등록 안내
            </h3>
            <ul className="text-blue-800 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>정확한 주소를 입력해야 배송이 원활히 진행됩니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>휴대폰 번호는 배송 시 연락을 위해 필요합니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>기본 배송지로 설정하면 주문 시 자동으로 선택됩니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>최대 10개까지 배송지를 등록할 수 있습니다</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              ✅ 주소 입력 팁
            </h3>
            <ul className="text-green-800 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>마할레, 소카크, 아파트명을 모두 포함해주세요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>층수와 호수를 정확히 기입해주세요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>전화번호는 터키 형식(05XX XXX XXXX)으로 입력</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>추가 정보에는 건물 입구나 경비실 안내를 작성</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}