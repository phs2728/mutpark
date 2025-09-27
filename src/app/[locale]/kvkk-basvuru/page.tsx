"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface KVKKApplication {
  requestType: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    tcNo: string;
    email: string;
    phone: string;
    address: string;
  };
  requestDetails: string;
  attachments: File[];
}

export default function KVKKApplicationPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [application, setApplication] = useState<KVKKApplication>({
    requestType: "",
    personalInfo: {
      firstName: "",
      lastName: "",
      tcNo: "",
      email: "",
      phone: "",
      address: "",
    },
    requestDetails: "",
    attachments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const requestTypes = [
    { value: "bilgi-talep", label: "Kişisel verilerimin işlenip işlenmediğini öğrenmek istiyorum" },
    { value: "erisim", label: "İşlenen kişisel verilerim hakkında bilgi talep ediyorum" },
    { value: "duzeltme", label: "Yanlış işlenen kişisel verilerimin düzeltilmesini istiyorum" },
    { value: "silme", label: "Kişisel verilerimin silinmesini/yok edilmesini istiyorum" },
    { value: "aktarim-bilgi", label: "Kişisel verilerimin kimlere aktarıldığını öğrenmek istiyorum" },
    { value: "itiraz", label: "Kişisel verilerimin işlenmesine itiraz ediyorum" },
    { value: "tasinabilirlik", label: "Kişisel verilerimin başka bir veri sorumlusuna aktarılmasını istiyorum" },
    { value: "zarar-tazmin", label: "KVKK ihlali nedeniyle zararımın tazminini talep ediyorum" },
  ];

  const handlePersonalInfoChange = (field: keyof typeof application.personalInfo, value: string) => {
    setApplication(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setApplication(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files],
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setApplication(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitted(true);
    } catch (error) {
      console.error("KVKK application submission error:", error);
      alert("Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            KVKK Başvurunuz Alındı
          </h1>
          <p className="text-gray-600 mb-6">
            Başvurunuz başarıyla iletildi. En geç 30 gün içinde size geri dönüş yapılacaktır.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Başvuru Numarası:</strong> KVKK-{Date.now()}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              Bu numarayı başvuru takibi için saklayınız.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href={`/${locale}/legal/privacy`}
              className="btn-outline w-full"
            >
              Gizlilik Politikasına Dön
            </Link>
            <Link
              href={`/${locale}`}
              className="btn-primary w-full"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📝 KVKK Başvuru Formu
          </h1>
          <p className="text-gray-600">
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında haklarınızı kullanmak için bu formu doldurun.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-yellow-900 mb-3">⚠️ Önemli Bilgiler</h2>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li>• Başvurunuz en geç 30 gün içinde değerlendirilecektir</li>
            <li>• Kimlik doğrulama için T.C. kimlik belgesi fotokopyası gereklidir</li>
            <li>• Başvurular ücretsizdir (kopyalama maliyeti hariç)</li>
            <li>• Başvuru sonucu e-posta veya posta yoluyla bildirilir</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Request Type */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              1. Başvuru Türü
            </h2>
            <div className="space-y-3">
              {requestTypes.map((type) => (
                <label key={type.value} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="requestType"
                    value={type.value}
                    checked={application.requestType === type.value}
                    onChange={(e) => setApplication(prev => ({ ...prev, requestType: e.target.value }))}
                    className="mt-1"
                    required
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Personal Information */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              2. Kişisel Bilgiler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={application.personalInfo.firstName}
                  onChange={(e) => handlePersonalInfoChange("firstName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={application.personalInfo.lastName}
                  onChange={(e) => handlePersonalInfoChange("lastName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  T.C. Kimlik No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={application.personalInfo.tcNo}
                  onChange={(e) => handlePersonalInfoChange("tcNo", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  pattern="[0-9]{11}"
                  maxLength={11}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={application.personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={application.personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={application.personalInfo.address}
                  onChange={(e) => handlePersonalInfoChange("address", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </section>

          {/* Request Details */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              3. Başvuru Detayları
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Başvurunuzun detaylarını açıklayın <span className="text-red-500">*</span>
              </label>
              <textarea
                value={application.requestDetails}
                onChange={(e) => setApplication(prev => ({ ...prev, requestDetails: e.target.value }))}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Hangi kişisel verilerinizle ilgili başvuru yapıyorsunuz? Detayları belirtiniz..."
                required
              />
            </div>
          </section>

          {/* File Attachments */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              4. Ekler
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Gerekli Belgeler:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• T.C. Kimlik Belgesi fotokopyası (zorunlu)</li>
                  <li>• Vekil tarafından başvuru yapılıyorsa vekalet belgesi</li>
                  <li>• Başvuruya destek olacak diğer belgeler (isteğe bağlı)</li>
                </ul>
              </div>

              <div>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Desteklenen formatlar: PDF, JPG, PNG, DOC, DOCX (Maks. 5MB)
                </p>
              </div>

              {application.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Yüklenen Dosyalar:</h4>
                  {application.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Kaldır
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Legal Agreement */}
          <section className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  required
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  Verdiğim bilgilerin doğru olduğunu, KVKK kapsamında başvuru hakkım olduğunu ve bu başvurunun değerlendirilmesi için gerekli işlemlerin yapılmasını kabul ediyorum. <span className="text-red-500">*</span>
                </span>
              </label>
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Link
              href={`/${locale}/legal/privacy`}
              className="btn-outline"
            >
              ← Gizlilik Politikasına Dön
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gönderiliyor...
                </>
              ) : (
                "📤 Başvuru Gönder"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}