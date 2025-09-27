"use client";

import { useState, useRef } from "react";
import { useI18n } from "@/providers/I18nProvider";
import { EnhancedTurkishAddressForm } from "@/components/checkout/EnhancedTurkishAddressForm";

interface Address {
  id: number;
  label?: string | null;
  recipientName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  postalCode?: string;
  addressLine2?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EnhancedAddressManagerProps {
  locale: string;
  initialAddresses?: Address[];
}

export function EnhancedAddressManager({ locale, initialAddresses = [] }: EnhancedAddressManagerProps) {
  const { t } = useI18n();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const formRef = useRef<HTMLDivElement>(null);

  const handleAddressSubmit = async (addressData: {
    recipientName: string;
    phone: string;
    city: string;
    district: string;
    street: string;
    postalCode: string;
    addressLine2?: string;
    isDefault?: boolean;
  }) => {
    setIsSubmitting(true);
    setError("");

    try {
      const url = editingAddress ? `/api/addresses/${editingAddress.id}` : "/api/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...addressData,
          isDefault: addresses.length === 0 // First address is default
        })
      });

      if (response.ok) {
        const savedAddress = await response.json();

        if (editingAddress) {
          setAddresses(prev => prev.map(addr =>
            addr.id === editingAddress.id ? savedAddress : addr
          ));
          setEditingAddress(null);
        } else {
          setAddresses(prev => [savedAddress, ...prev]);
          setShowAddForm(false);
        }
      } else {
        throw new Error("Address save failed");
      }
    } catch (error) {
      console.error("Address save error:", error);
      setError(t("address.saveError", "Adres kaydedilirken bir hata oluştu"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}/default`, {
        method: "POST"
      });

      if (response.ok) {
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        })));
      }
    } catch (error) {
      console.error("Set default error:", error);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm(t("address.deleteConfirm", "Bu adresi silmek istediğinizden emin misiniz?"))) {
      return;
    }

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      }
    } catch (error) {
      console.error("Delete address error:", error);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
    setShowAddForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📍 {t("address.title", "Adreslerim")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("address.subtitle", "Teslimat adreslerinizi yönetin")}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          ➕ {t("address.addNew", "Yeni Adres Ekle")}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          ❌ {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div ref={formRef} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingAddress ?
                `✏️ ${t("address.edit", "Adres Düzenle")}` :
                `➕ ${t("address.addNew", "Yeni Adres Ekle")}`
              }
            </h2>
            <button
              onClick={handleCancelEdit}
              className="btn-outline text-sm"
            >
              ✕ {t("address.cancel", "İptal")}
            </button>
          </div>

          <EnhancedTurkishAddressForm
            onAddressChange={handleAddressSubmit}
            initialData={editingAddress ? {
              recipientName: editingAddress.recipientName,
              phone: editingAddress.phone,
              city: editingAddress.city,
              district: editingAddress.district,
              street: editingAddress.street,
              postalCode: editingAddress.postalCode || "",
              addressLine2: editingAddress.addressLine2,
              isDefault: editingAddress.isDefault
            } : undefined}
            showTitle={false}
            addressType="shipping"
          />

          {isSubmitting && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                {t("address.saving", "Kaydediliyor...")}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("address.noAddresses", "Henüz adresiniz yok")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("address.addFirstAddress", "İlk adresinizi ekleyerek başlayın")}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            ➕ {t("address.addNew", "Yeni Adres Ekle")}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`relative bg-white dark:bg-gray-800 rounded-lg border p-6 transition-all ${
                address.isDefault
                  ? "border-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              {/* Default Badge */}
              {address.isDefault && (
                <div className="absolute top-4 right-4">
                  <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                    ⭐ {t("address.default", "Varsayılan")}
                  </span>
                </div>
              )}

              {/* Address Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {address.recipientName}
                </h3>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>📞 {address.phone}</p>
                  <p>📍 {address.city}, {address.district}</p>
                  <p className="leading-relaxed">{address.street}</p>
                  {address.addressLine2 && (
                    <p className="text-gray-500">{address.addressLine2}</p>
                  )}
                  {address.postalCode && (
                    <p>📮 {address.postalCode}</p>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  {t("address.createdAt", "Oluşturulma")}: {formatDate(address.createdAt)}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="btn-outline text-xs"
                  >
                    ⭐ {t("address.setDefault", "Varsayılan Yap")}
                  </button>
                )}

                <button
                  onClick={() => handleEditAddress(address)}
                  className="btn-outline text-xs"
                >
                  ✏️ {t("address.edit", "Düzenle")}
                </button>

                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                  disabled={address.isDefault && addresses.length === 1}
                >
                  🗑️ {t("address.delete", "Sil")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Limit Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 dark:bg-gray-900/50 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-blue-600">ℹ️</span>
          <div className="text-sm">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              {t("address.info.title", "Adres Bilgileri")}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {t("address.info.description", "En fazla 10 adres kaydedebilirsiniz. Varsayılan adres siparişlerinizde otomatik olarak seçilir.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}