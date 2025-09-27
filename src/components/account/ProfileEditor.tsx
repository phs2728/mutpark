"use client";

import { useState, useRef } from "react";
import { useI18n } from "@/providers/I18nProvider";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  locale: string;
  currency: string;
  avatar?: string;
  marketingConsent: boolean;
  smsConsent: boolean;
  emailConsent: boolean;
}

interface ProfileEditorProps {
  locale: string;
  initialData: ProfileData;
  onUpdate?: (data: ProfileData) => void;
}

export function ProfileEditor({ locale, initialData, onUpdate }: ProfileEditorProps) {
  const { t } = useI18n();
  const [profileData, setProfileData] = useState<ProfileData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.name.trim()) {
      newErrors.name = t("profile.errors.nameRequired", "Ad ve soyad gereklidir");
    }

    if (!profileData.email.trim()) {
      newErrors.email = t("profile.errors.emailRequired", "E-posta gereklidir");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = t("profile.errors.emailInvalid", "Geçerli bir e-posta adresi giriniz");
    }

    if (profileData.phone && !/^(\+90|0)?[5][0-9]{2}[0-9]{3}[0-9]{4}$/.test(profileData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t("profile.errors.phoneInvalid", "Geçerli bir Türkiye telefon numarası giriniz");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfileData(updatedProfile);
        setSuccessMessage(t("profile.updateSuccess", "Profil bilgileriniz başarıyla güncellendi"));
        onUpdate?.(updatedProfile);
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setErrors({ general: t("profile.updateError", "Profil güncellenirken bir hata oluştu") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const { avatarUrl } = await response.json();
        setProfileData(prev => ({ ...prev, avatar: avatarUrl }));
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
    }
  };

  const genderOptions = [
    { value: "MALE", label: t("profile.gender.male", "Erkek") },
    { value: "FEMALE", label: t("profile.gender.female", "Kadın") },
    { value: "OTHER", label: t("profile.gender.other", "Diğer") }
  ];

  const localeOptions = [
    { value: "tr", label: "Türkçe" },
    { value: "en", label: "English" },
    { value: "ko", label: "한국어" }
  ];

  const currencyOptions = [
    { value: "TRY", label: "Turkish Lira (₺)" },
    { value: "USD", label: "US Dollar ($)" },
    { value: "EUR", label: "Euro (€)" }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          👤 {t("profile.title", "Profil Bilgilerim")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t("profile.subtitle", "Kişisel bilgilerinizi güncelleyebilirsiniz")}
        </p>
      </div>

      {/* KVKK Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="text-blue-600">🔒</span>
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200">
              {t("profile.kvkk.title", "Kişisel Verilerin Korunması")}
            </p>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              {t("profile.kvkk.description", "Kişisel verileriniz KVKK kapsamında korunmaktadır. Detaylı bilgi için gizlilik politikamızı inceleyebilirsiniz.")}
            </p>
            <a
              href={`/${locale}/legal/privacy`}
              target="_blank"
              className="text-blue-600 underline hover:text-blue-700 mt-2 inline-block"
            >
              {t("profile.kvkk.readMore", "Gizlilik Politikası")} →
            </a>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
            ✅ {successMessage}
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            ❌ {errors.general}
          </div>
        )}

        {/* Avatar Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📸 {t("profile.avatar.title", "Profil Fotoğrafı")}
          </h3>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {profileData.avatar ? (
                <img
                  src={profileData.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-outline text-sm"
              >
                {t("profile.avatar.change", "Fotoğraf Değiştir")}
              </button>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {t("profile.avatar.hint", "JPG, PNG formatında, maksimum 2MB")}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarUpload(file);
            }}
          />
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ℹ️ {t("profile.personal.title", "Kişisel Bilgiler")}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("profile.name", "Ad ve Soyad")} *
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                placeholder={t("profile.namePlaceholder", "Ad ve soyadınızı giriniz")}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("profile.email", "E-posta")} *
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                placeholder={t("profile.emailPlaceholder", "E-posta adresinizi giriniz")}
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("profile.phone", "Telefon Numarası")}
              </label>
              <input
                type="tel"
                value={profileData.phone || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                placeholder="+90 5xx xxx xxxx"
              />
              {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("profile.dateOfBirth", "Doğum Tarihi")}
              </label>
              <input
                type="date"
                value={profileData.dateOfBirth || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("profile.gender", "Cinsiyet")}
              </label>
              <select
                value={profileData.gender || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t("profile.selectGender", "Cinsiyet seçiniz")}</option>
                {genderOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("profile.language", "Dil")}
              </label>
              <select
                value={profileData.locale}
                onChange={(e) => setProfileData(prev => ({ ...prev, locale: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {localeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Communication Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📧 {t("profile.communication.title", "İletişim Tercihleri")}
          </h3>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profileData.emailConsent}
                onChange={(e) => setProfileData(prev => ({ ...prev, emailConsent: e.target.checked }))}
                className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t("profile.communication.email", "E-posta bildirimleri")}
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t("profile.communication.emailDesc", "Kampanya, indirim ve yeni ürün bilgilerini e-posta ile almak istiyorum")}
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profileData.smsConsent}
                onChange={(e) => setProfileData(prev => ({ ...prev, smsConsent: e.target.checked }))}
                className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t("profile.communication.sms", "SMS bildirimleri")}
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t("profile.communication.smsDesc", "Sipariş durumu ve önemli bilgileri SMS ile almak istiyorum")}
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profileData.marketingConsent}
                onChange={(e) => setProfileData(prev => ({ ...prev, marketingConsent: e.target.checked }))}
                className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t("profile.communication.marketing", "Pazarlama iletişimi")}
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t("profile.communication.marketingDesc", "Kişiselleştirilmiş öneriler ve pazarlama içeriklerini almak istiyorum")}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setProfileData(initialData)}
            className="btn-outline"
          >
            {t("profile.reset", "Sıfırla")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t("profile.saving", "Kaydediliyor...")}
              </span>
            ) : (
              t("profile.save", "Değişiklikleri Kaydet")
            )}
          </button>
        </div>
      </form>
    </div>
  );
}