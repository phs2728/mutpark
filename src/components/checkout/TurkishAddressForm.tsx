"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/providers/I18nProvider";

// 터키 주요 도시 데이터
const TURKISH_CITIES = [
  { code: "34", name: "İstanbul", districts: ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Fatih", "Beyoğlu", "Bakırköy", "Maltepe", "Kartal", "Pendik"] },
  { code: "06", name: "Ankara", districts: ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Sincan", "Etimesgut", "Gölbaşı", "Pursaklar"] },
  { code: "35", name: "İzmir", districts: ["Konak", "Karşıyaka", "Bornova", "Buca", "Bayraklı", "Gaziemir", "Alsancak", "Balçova"] },
  { code: "07", name: "Antalya", districts: ["Muratpaşa", "Kepez", "Konyaaltı", "Aksu", "Döşemealtı"] },
  { code: "16", name: "Bursa", districts: ["Osmangazi", "Nilüfer", "Yıldırım", "Mudanya", "Gemlik"] },
  { code: "01", name: "Adana", districts: ["Seyhan", "Yüreğir", "Çukurova", "Sarıçam"] },
  { code: "33", name: "Mersin", districts: ["Akdeniz", "Mezitli", "Yenişehir", "Toroslar"] },
  { code: "42", name: "Konya", districts: ["Meram", "Karatay", "Selçuklu"] },
  { code: "61", name: "Trabzon", districts: ["Ortahisar", "Akçaabat", "Yomra"] },
  { code: "55", name: "Samsun", districts: ["İlkadım", "Canik", "Atakum"] }
];

interface TurkishAddressFormProps {
  onAddressChange: (address: {
    recipientName: string;
    phone: string;
    city: string;
    district: string;
    street: string;
    postalCode: string;
    addressLine2?: string;
  }) => void;
  initialData?: {
    recipientName?: string;
    phone?: string;
    city?: string;
    district?: string;
    street?: string;
    postalCode?: string;
    addressLine2?: string;
  };
  showTitle?: boolean;
}

export function TurkishAddressForm({
  onAddressChange,
  initialData = {},
  showTitle = true
}: TurkishAddressFormProps) {
  const { t } = useI18n();

  const [recipientName, setRecipientName] = useState(initialData.recipientName || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [city, setCity] = useState(initialData.city || "");
  const [district, setDistrict] = useState(initialData.district || "");
  const [street, setStreet] = useState(initialData.street || "");
  const [postalCode, setPostalCode] = useState(initialData.postalCode || "");
  const [addressLine2, setAddressLine2] = useState(initialData.addressLine2 || "");

  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");

  // 도시 선택 시 구/군 업데이트
  useEffect(() => {
    const selectedCity = TURKISH_CITIES.find(c => c.name === city);
    if (selectedCity) {
      setAvailableDistricts(selectedCity.districts);
      setDistrict(""); // 도시 변경 시 구/군 초기화
    } else {
      setAvailableDistricts([]);
    }
  }, [city]);

  // 주소 데이터 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    // 모든 필수 필드가 채워진 경우에만 콜백 호출
    if (recipientName && phone && city && district && street) {
      onAddressChange({
        recipientName,
        phone,
        city,
        district,
        street,
        postalCode,
        addressLine2,
      });
    }
  }, [recipientName, phone, city, district, street, postalCode, addressLine2, onAddressChange]);

  // 터키 전화번호 검증 (+90 5xx xxx xxxx)
  const validatePhone = (phoneNumber: string) => {
    const turkishPhoneRegex = /^(\+90|0)?[5][0-9]{2}[0-9]{3}[0-9]{4}$/;
    return turkishPhoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  // 이름 검증 (터키어 문자 허용)
  const validateName = (name: string) => {
    const nameRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]{2,50}$/;
    return nameRegex.test(name);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (value && !validatePhone(value)) {
      setPhoneError(t("checkout.address.phoneInvalid", "Geçerli bir Türkiye telefon numarası giriniz"));
    } else {
      setPhoneError("");
    }
  };

  const handleNameChange = (value: string) => {
    setRecipientName(value);
    if (value && !validateName(value)) {
      setNameError(t("checkout.address.nameInvalid", "Geçerli bir isim giriniz"));
    } else {
      setNameError("");
    }
  };

  return (
    <div className="space-y-6">
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📍 {t("checkout.address.deliveryAddress", "Teslimat Adresi")}
        </h3>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 받는 사람 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("checkout.address.recipientName", "Alıcı Adı")} *
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={t("checkout.address.recipientNamePlaceholder", "Ad ve Soyad")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              nameError ? "border-red-500" : "border-gray-300"
            } dark:bg-gray-800 dark:border-gray-600 dark:text-white`}
            required
          />
          {nameError && (
            <p className="text-sm text-red-600 mt-1">{nameError}</p>
          )}
        </div>

        {/* 전화번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("checkout.address.phone", "Telefon Numarası")} *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+90 5xx xxx xxxx"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              phoneError ? "border-red-500" : "border-gray-300"
            } dark:bg-gray-800 dark:border-gray-600 dark:text-white`}
            required
          />
          {phoneError && (
            <p className="text-sm text-red-600 mt-1">{phoneError}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 도시 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("checkout.address.city", "İl")} *
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="">{t("checkout.address.selectCity", "İl Seçiniz")}</option>
            {TURKISH_CITIES.map((cityData) => (
              <option key={cityData.code} value={cityData.name}>
                {cityData.name}
              </option>
            ))}
          </select>
        </div>

        {/* 구/군 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("checkout.address.district", "İlçe")} *
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            disabled={!city}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:disabled:bg-gray-700"
            required
          >
            <option value="">{t("checkout.address.selectDistrict", "İlçe Seçiniz")}</option>
            {availableDistricts.map((districtName) => (
              <option key={districtName} value={districtName}>
                {districtName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 상세 주소 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("checkout.address.street", "Adres")} *
        </label>
        <textarea
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder={t("checkout.address.streetPlaceholder", "Mahalle, Sokak, Apartman adı, Kat, Daire no")}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 우편번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("checkout.address.postalCode", "Posta Kodu")}
          </label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="34000"
            maxLength={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* 추가 정보 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("checkout.address.additionalInfo", "Ek Bilgi")}
          </label>
          <input
            type="text"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder={t("checkout.address.additionalInfoPlaceholder", "Kapıcı, tarif vs.")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* 유효성 검사 상태 표시 */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-3 h-3 rounded-full ${
          recipientName && phone && city && district && street && !phoneError && !nameError
            ? "bg-green-500"
            : "bg-gray-300"
        }`}></div>
        <span className="text-gray-600 dark:text-gray-400">
          {recipientName && phone && city && district && street && !phoneError && !nameError
            ? t("checkout.address.valid", "Adres bilgileri tamamlandı")
            : t("checkout.address.fillRequired", "Zorunlu alanları doldurunuz")
          }
        </span>
      </div>
    </div>
  );
}