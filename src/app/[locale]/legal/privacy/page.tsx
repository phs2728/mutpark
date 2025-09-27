import { useI18n } from "@/providers/I18nProvider";
import Link from "next/link";

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🛡️ Gizlilik Politikası ve KVKK Aydınlatma Metni
          </h1>
          <p className="text-gray-600">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Bu metin 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hazırlanmıştır.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-3">📋 İçindekiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <a href="#veri-sorumlusu" className="text-blue-600 hover:text-blue-800">1. Veri Sorumlusu</a>
            <a href="#islenen-veriler" className="text-blue-600 hover:text-blue-800">2. İşlenen Kişisel Veriler</a>
            <a href="#isleme-amaci" className="text-blue-600 hover:text-blue-800">3. Veri İşleme Amaçları</a>
            <a href="#veri-paylaimi" className="text-blue-600 hover:text-blue-800">4. Veri Paylaşımı</a>
            <a href="#veri-guvenlik" className="text-blue-600 hover:text-blue-800">5. Veri Güvenliği</a>
            <a href="#haklariniz" className="text-blue-600 hover:text-blue-800">6. KVKK Haklarınız</a>
            <a href="#cerezler" className="text-blue-600 hover:text-blue-800">7. Çerez Politikası</a>
            <a href="#iletisim" className="text-blue-600 hover:text-blue-800">8. İletişim</a>
          </div>
        </div>

        <div className="space-y-8">
          {/* 1. Veri Sorumlusu */}
          <section id="veri-sorumlusu" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              1. Veri Sorumlusu Bilgileri
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="mb-4"><strong>Şirket Unvanı:</strong> MutPark E-Ticaret A.Ş.</p>
              <p className="mb-4"><strong>Adres:</strong> [Şirket Adresi Buraya Eklenecek]</p>
              <p className="mb-4"><strong>E-posta:</strong> kvkk@mutpark.com</p>
              <p className="mb-4"><strong>Telefon:</strong> [Telefon Numarası]</p>
              <p className="text-sm text-gray-600">
                KVKK kapsamında kişisel verilerinizin işlenmesinden sorumlu olan veri sorumlusudur.
              </p>
            </div>
          </section>

          {/* 2. İşlenen Kişisel Veriler */}
          <section id="islenen-veriler" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              2. İşlenen Kişisel Veriler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">👤 Kimlik Bilgileri</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Ad, soyad</li>
                  <li>• E-posta adresi</li>
                  <li>• Telefon numarası</li>
                  <li>• Doğum tarihi (isteğe bağlı)</li>
                </ul>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">📍 Adres Bilgileri</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Teslimat adresi</li>
                  <li>• Fatura adresi</li>
                  <li>• Şehir, ilçe, posta kodu</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-3">💳 Finansal Bilgiler</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Ödeme geçmişi</li>
                  <li>• Sipariş bilgileri</li>
                  <li>• Fatura bilgileri</li>
                  <li className="text-red-600">• Kredi kartı bilgileri saklanmaz</li>
                </ul>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-3">🖥️ Teknik Bilgiler</h3>
                <ul className="space-y-2 text-sm">
                  <li>• IP adresi</li>
                  <li>• Tarayıcı bilgileri</li>
                  <li>• Çerez verileri</li>
                  <li>• Site kullanım logları</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Veri İşleme Amaçları */}
          <section id="isleme-amaci" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              3. Kişisel Veri İşleme Amaçları ve Hukuki Dayanakları
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left">İşleme Amacı</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Hukuki Dayanak</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Saklama Süresi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">Üyelik ve hesap yönetimi</td>
                    <td className="border border-gray-300 px-4 py-3">Sözleşmenin kurulması ve ifası</td>
                    <td className="border border-gray-300 px-4 py-3">Üyelik sonuna kadar + 5 yıl</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">Sipariş işlemleri</td>
                    <td className="border border-gray-300 px-4 py-3">Sözleşmenin ifası</td>
                    <td className="border border-gray-300 px-4 py-3">10 yıl (VUK gereksinimi)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">Pazarlama faaliyetleri</td>
                    <td className="border border-gray-300 px-4 py-3">Açık rıza</td>
                    <td className="border border-gray-300 px-4 py-3">Rıza geri alınana kadar</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">Müşteri hizmetleri</td>
                    <td className="border border-gray-300 px-4 py-3">Meşru menfaat</td>
                    <td className="border border-gray-300 px-4 py-3">3 yıl</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">Güvenlik ve dolandırıcılık önleme</td>
                    <td className="border border-gray-300 px-4 py-3">Meşru menfaat</td>
                    <td className="border border-gray-300 px-4 py-3">5 yıl</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Veri Paylaşımı */}
          <section id="veri-paylaimi" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              4. Kişisel Verilerin Paylaşılması
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-red-50 border-l-4 border-red-400 p-6">
                <h3 className="font-semibold text-red-900 mb-3">🚚 Kargo Şirketleri</h3>
                <p className="text-sm text-red-800">
                  Teslimat için gerekli adres ve iletişim bilgileri paylaşılır.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
                <h3 className="font-semibold text-blue-900 mb-3">💳 Ödeme Sağlayıcıları</h3>
                <p className="text-sm text-blue-800">
                  Ödeme işlemleri için PCI-DSS uyumlu sistemler kullanılır.
                </p>
              </div>
              <div className="bg-gray-50 border-l-4 border-gray-400 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">⚖️ Yasal Yükümlülükler</h3>
                <p className="text-sm text-gray-800">
                  Mahkeme kararı veya yasal zorunluluk durumunda yetkili makamlarla paylaşılabilir.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Veri Güvenliği */}
          <section id="veri-guvenlik" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              5. Veri Güvenliği Önlemleri
            </h2>
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-900 mb-3">🔒 Teknik Önlemler</h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>• SSL/TLS şifreleme</li>
                    <li>• Güvenlik duvarları</li>
                    <li>• Düzenli güvenlik testleri</li>
                    <li>• Veri yedekleme</li>
                    <li>• Erişim kontrolü</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-3">👥 İdari Önlemler</h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>• Personel eğitimleri</li>
                    <li>• Gizlilik anlaşmaları</li>
                    <li>• Erişim yetkilendirme</li>
                    <li>• Veri işleme kayıtları</li>
                    <li>• Düzenli denetimler</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 6. KVKK Hakları */}
          <section id="haklariniz" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              6. KVKK Kapsamındaki Haklarınız
            </h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="font-semibold text-blue-900 mb-4">
                6698 sayılı KVKK'nun 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 font-bold">1.</span>
                    <div>
                      <h4 className="font-semibold text-blue-900">Bilgi Talep Etme</h4>
                      <p className="text-sm text-blue-800">Kişisel verilerinizin işlenip işlenmediğini öğrenme</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 font-bold">2.</span>
                    <div>
                      <h4 className="font-semibold text-blue-900">Erişim Hakkı</h4>
                      <p className="text-sm text-blue-800">İşlenen verileriniz hakkında bilgi talep etme</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 font-bold">3.</span>
                    <div>
                      <h4 className="font-semibold text-blue-900">Düzeltme Hakkı</h4>
                      <p className="text-sm text-blue-800">Yanlış verilerin düzeltilmesini isteme</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 font-bold">4.</span>
                    <div>
                      <h4 className="font-semibold text-blue-900">Silme Hakkı</h4>
                      <p className="text-sm text-blue-800">Verilerinizin silinmesini talep etme</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 font-bold">5.</span>
                    <div>
                      <h4 className="font-semibold text-blue-900">Aktarım Bilgisi</h4>
                      <p className="text-sm text-blue-800">Verilerin kimlere aktarıldığını öğrenme</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 font-bold">6.</span>
                    <div>
                      <h4 className="font-semibold text-blue-900">İtiraz Hakkı</h4>
                      <p className="text-sm text-blue-800">Veri işlemeye itiraz etme</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 font-bold">7.</span>
                    <div>
                      <h4 className="font-semibold text-blue-900">Zarar Tazminat</h4>
                      <p className="text-sm text-blue-800">Zararınızın tazminini talep etme</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 font-bold">8.</span>
                    <div>
                      <h4 className="font-semibold text-blue-900">Taşınabilirlik</h4>
                      <p className="text-sm text-blue-800">Verilerinizi başka yere taşıma</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Çerez Politikası */}
          <section id="cerezler" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              7. Çerez (Cookie) Politikası
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">✅ Zorunlu Çerezler</h3>
                <p className="text-sm text-green-800 mb-3">
                  Sitenin çalışması için gerekli çerezler.
                </p>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Oturum yönetimi</li>
                  <li>• Güvenlik</li>
                  <li>• Sepet bilgileri</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">📊 Analitik Çerezler</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Site kullanımını analiz eden çerezler (isteğe bağlı).
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Google Analytics</li>
                  <li>• Ziyaretçi istatistikleri</li>
                  <li>• Performans ölçümü</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-3">🎯 Pazarlama Çerezleri</h3>
                <p className="text-sm text-purple-800 mb-3">
                  Kişiselleştirilmiş reklamlar için (isteğe bağlı).
                </p>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>• Sosyal medya entegrasyonu</li>
                  <li>• Remarketing</li>
                  <li>• İlgi alanı hedeflemesi</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 8. İletişim */}
          <section id="iletisim" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              8. İletişim ve Başvuru
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">📧 KVKK Başvuru İletişim</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>E-posta:</strong> kvkk@mutpark.com</p>
                    <p><strong>Posta:</strong> MutPark E-Ticaret A.Ş. KVKK Sorumlusu</p>
                    <p><strong>Başvuru Formu:</strong> <Link href={`/${locale}/kvkk-basvuru`} className="text-blue-600 hover:text-blue-800">Online Form</Link></p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">⏱️ Başvuru İşleme Süreleri</h3>
                  <div className="space-y-2 text-sm">
                    <p>• <strong>Cevap süresi:</strong> En geç 30 gün</p>
                    <p>• <strong>Ücret:</strong> Ücretsiz (kopyalama maliyeti hariç)</p>
                    <p>• <strong>Kimlik doğrulama:</strong> T.C. kimlik belgesi</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Yasal Uyarı */}
          <section className="border-t border-gray-200 pt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-900 mb-3">⚖️ Yasal Uyarı</h3>
              <p className="text-sm text-yellow-800 mb-4">
                Bu gizlilik politikası 6698 sayılı Kişisel Verilerin Korunması Kanunu ve ilgili mevzuat uyarınca hazırlanmıştır.
                Politikada değişiklik yapma hakkımız saklıdır. Değişiklikler web sitesi üzerinden duyurulacaktır.
              </p>
              <p className="text-xs text-yellow-700">
                Bu sayfa son olarak {new Date().toLocaleDateString('tr-TR')} tarihinde güncellenmiştir.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Link
              href={`/${locale}`}
              className="btn-outline"
            >
              ← Ana Sayfaya Dön
            </Link>
            <div className="flex gap-3">
              <Link
                href={`/${locale}/kvkk-basvuru`}
                className="btn-primary"
              >
                📝 KVKK Başvuru Yap
              </Link>
              <Link
                href={`/${locale}/legal/terms`}
                className="btn-outline"
              >
                📋 Kullanım Şartları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}