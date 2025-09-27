"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/providers/I18nProvider";
import { TURKISH_CITIES_COMPLETE, getCityDistricts } from "./CompleteTurkishCities";

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

interface EnhancedTurkishAddressFormProps {
  onAddressChange: (address: AddressData) => void;
  initialData?: Partial<AddressData>;
  showTitle?: boolean;
  showBillingOption?: boolean;
  addressType?: "shipping" | "billing";
  onAddressTypeChange?: (isSameAsShipping: boolean) => void;
}

export function EnhancedTurkishAddressForm({
  onAddressChange,
  initialData = {},
  showTitle = true,
  showBillingOption = false,
  addressType = "shipping",
  onAddressTypeChange
}: EnhancedTurkishAddressFormProps) {
  const { t } = useI18n();

  const [formData, setFormData] = useState<AddressData>({
    recipientName: initialData.recipientName || "",
    phone: initialData.phone || "",
    city: initialData.city || "",
    district: initialData.district || "",
    street: initialData.street || "",
    postalCode: initialData.postalCode || "",
    addressLine2: initialData.addressLine2 || "",
    isDefault: initialData.isDefault || false
  });

  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSameAsShipping, setIsSameAsShipping] = useState(true);

  // 도시 변경 시 일체 목록 업데이트
  useEffect(() => {
    if (formData.city) {
      const districts = getCityDistricts(formData.city);
      setAvailableDistricts(districts);

      // 현재 선택된 일체가 새 도시에 없으면 초기화
      if (formData.district && !districts.includes(formData.district)) {
        setFormData(prev => ({ ...prev, district: "" }));
      }
    } else {
      setAvailableDistricts([]);
      setFormData(prev => ({ ...prev, district: "" }));
    }
  }, [formData.city]);

  // 폼 데이터 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    onAddressChange(formData);
  }, [formData, onAddressChange]);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case "recipientName":
        if (!value.trim()) {
          newErrors.recipientName = "받는 분 이름을 입력해주세요";
        } else if (value.length < 2) {
          newErrors.recipientName = "이름은 최소 2글자 이상이어야 합니다";
        } else {
          delete newErrors.recipientName;
        }
        break;

      case "phone":
        const phoneRegex = /^(\+90|0)?[5][0-9]{2}[0-9]{3}[0-9]{4}$/;
        if (!value.trim()) {
          newErrors.phone = "전화번호를 입력해주세요";
        } else if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          newErrors.phone = "올바른 터키 전화번호를 입력해주세요 (예: 05XX XXX XXXX)";
        } else {
          delete newErrors.phone;
        }
        break;

      case "city":
        if (!value) {
          newErrors.city = "도시를 선택해주세요";
        } else {
          delete newErrors.city;
        }
        break;

      case "district":
        if (!value) {
          newErrors.district = "일체/구를 선택해주세요";
        } else {
          delete newErrors.district;
        }
        break;

      case "street":
        if (!value.trim()) {
          newErrors.street = "상세 주소를 입력해주세요";
        } else if (value.length < 10) {
          newErrors.street = "상세 주소를 더 자세히 입력해주세요";
        } else {
          delete newErrors.street;
        }
        break;

      case "postalCode":
        if (value && (!/^\d{5}$/.test(value))) {
          newErrors.postalCode = "우편번호는 5자리 숫자여야 합니다";
        } else {
          delete newErrors.postalCode;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: keyof AddressData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    if (typeof value === "string") {
      validateField(name, value);
    }
  };

  const handleBillingOptionChange = (sameAsShipping: boolean) => {
    setIsSameAsShipping(sameAsShipping);
    onAddressTypeChange?.(sameAsShipping);
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 11) {
      return digits.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return value;
  };

  const isFormValid = formData.recipientName &&
                     formData.phone &&
                     formData.city &&
                     formData.district &&
                     formData.street &&
                     Object.keys(errors).length === 0;

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {addressType === "billing" ? "청구지 정보" : "배송지 정보"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {addressType === "billing"
              ? "청구서를 받을 주소를 입력해주세요"
              : "상품을 받을 주소를 정확히 입력해주세요"
            }
          </p>
        </div>
      )}

      {/* 배송지/청구지 동일 여부 선택 */}
      {showBillingOption && addressType === "billing" && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                checked={isSameAsShipping}
                onChange={() => handleBillingOptionChange(true)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                배송지와 동일
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                checked={!isSameAsShipping}
                onChange={() => handleBillingOptionChange(false)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                다른 주소 사용
              </span>
            </label>
          </div>
        </div>
      )}

      {/* 주소 폼 (청구지가 배송지와 다를 때만 표시) */}
      {(!showBillingOption || addressType === "shipping" || !isSameAsShipping) && (
        <div className="grid grid-cols-1 gap-6">
          {/* 받는 분 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              받는 분 이름 *
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => handleInputChange("recipientName", e.target.value)}
              onBlur={(e) => validateField("recipientName", e.target.value)}
              placeholder="받는 분의 성함을 입력해주세요"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.recipientName
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              } dark:bg-gray-800 dark:border-gray-600 dark:text-white`}
            />
            {errors.recipientName && (
              <p className="mt-1 text-sm text-red-600">{errors.recipientName}</p>
            )}
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              전화번호 *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                handleInputChange("phone", formatted);
              }}
              onBlur={(e) => validateField("phone", e.target.value)}
              placeholder="05XX XXX XXXX"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.phone
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              } dark:bg-gray-800 dark:border-gray-600 dark:text-white`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* 도시 및 일체 선택 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 도시 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                도시 *
              </label>
              <select
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                onBlur={(e) => validateField("city", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.city
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } dark:bg-gray-800 dark:border-gray-600 dark:text-white`}
              >
                <option value="">도시를 선택하세요</option>
                {TURKISH_CITIES_COMPLETE.map((city) => (
                  <option key={city.code} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            {/* 일체/구 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                일체/구 *
              </label>
              <select
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                onBlur={(e) => validateField("district", e.target.value)}
                disabled={!formData.city}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.district
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:disabled:bg-gray-700`}
              >
                <option value="">일체/구를 선택하세요</option>
                {availableDistricts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="mt-1 text-sm text-red-600">{errors.district}</p>
              )}
            </div>
          </div>

          {/* 상세 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              상세 주소 *
            </label>
            <textarea
              value={formData.street}
              onChange={(e) => handleInputChange("street", e.target.value)}
              onBlur={(e) => validateField("street", e.target.value)}
              placeholder="마할레, 소카크, 아파트명, 층수, 호수 등을 상세히 입력해주세요"
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.street
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              } dark:bg-gray-800 dark:border-gray-600 dark:text-white`}
            />
            {errors.street && (
              <p className="mt-1 text-sm text-red-600">{errors.street}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 우편번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                우편번호
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                  handleInputChange("postalCode", value);
                }}
                onBlur={(e) => validateField("postalCode", e.target.value)}
                placeholder="34000"
                maxLength={5}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.postalCode
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } dark:bg-gray-800 dark:border-gray-600 dark:text-white`}
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
              )}
            </div>

            {/* 추가 정보 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                추가 정보
              </label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                placeholder="건물 입구, 경비실 등 추가 안내사항"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* 기본 배송지 설정 */}
          {addressType === "shipping" && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => handleInputChange("isDefault", e.target.checked)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                기본 배송지로 설정
              </label>
            </div>
          )}

          {/* 폼 유효성 상태 표시 */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className={`w-3 h-3 rounded-full transition-colors ${
              isFormValid ? "bg-green-500" : "bg-gray-300"
            }`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isFormValid
                ? "✅ 주소 정보가 완성되었습니다"
                : "⚠️ 필수 항목을 모두 입력해주세요"
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}