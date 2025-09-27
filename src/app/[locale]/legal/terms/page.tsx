import Link from "next/link";

export default async function TermsOfServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📋 Kullanım Şartları ve Koşulları
          </h1>
          <p className="text-gray-600">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Bu şartlar Türk Ticaret Kanunu ve 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında hazırlanmıştır.
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-3">📑 İçindekiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <a href="#genel-hukumler" className="text-blue-600 hover:text-blue-800">1. Genel Hükümler</a>
            <a href="#uyelik" className="text-blue-600 hover:text-blue-800">2. Üyelik ve Hesap</a>
            <a href="#siparis" className="text-blue-600 hover:text-blue-800">3. Sipariş ve Satış</a>
            <a href="#odeme" className="text-blue-600 hover:text-blue-800">4. Ödeme ve Fatura</a>
            <a href="#teslimat" className="text-blue-600 hover:text-blue-800">5. Teslimat</a>
            <a href="#iade" className="text-blue-600 hover:text-blue-800">6. İade ve Değişim</a>
            <a href="#sorumluluklar" className="text-blue-600 hover:text-blue-800">7. Sorumluluklar</a>
            <a href="#fikri-mulkiyet" className="text-blue-600 hover:text-blue-800">8. Fikri Mülkiyet</a>
            <a href="#gizlilik" className="text-blue-600 hover:text-blue-800">9. Gizlilik</a>
            <a href="#uyusmazlik" className="text-blue-600 hover:text-blue-800">10. Uyuşmazlık Çözümü</a>
          </div>
        </div>

        <div className="space-y-8">
          {/* 1. Genel Hükümler */}
          <section id="genel-hukumler" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              1. Genel Hükümler
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1.1 Tanımlar</h3>
                <ul className="text-sm text-gray-700 space-y-2 ml-4">
                  <li>• <strong>Platform:</strong> MutPark E-Ticaret A.Ş. tarafından işletilen www.mutpark.com web sitesi</li>
                  <li>• <strong>Kullanıcı/Müşteri:</strong> Platformu kullanan gerçek veya tüzel kişiler</li>
                  <li>• <strong>Satıcı:</strong> MutPark E-Ticaret A.Ş.</li>
                  <li>• <strong>Ürün:</strong> Platform üzerinden satışa sunulan mal ve hizmetler</li>
                  <li>• <strong>Sipariş:</strong> Kullanıcının ürün satın alma talebi</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1.2 Şartların Kabulü</h3>
                <p className="text-sm text-gray-700">
                  Bu platformu kullanarak, bu kullanım şartlarını okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz.
                  Bu şartları kabul etmiyorsanız, platformu kullanmamalısınız.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1.3 Şartların Değiştirilmesi</h3>
                <p className="text-sm text-gray-700">
                  MutPark, bu şartları istediği zaman değiştirme hakkını saklı tutar. Değişiklikler web sitesi üzerinden
                  duyurulacak ve yürürlük tarihinden itibaren geçerli olacaktır.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Üyelik ve Hesap */}
          <section id="uyelik" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              2. Üyelik ve Hesap Yönetimi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">👤 Üyelik Koşulları</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• 18 yaşını tamamlamış olmak</li>
                  <li>• Doğru ve güncel bilgi vermek</li>
                  <li>• Hesap güvenliğini sağlamak</li>
                  <li>• Bir kişi bir hesap açabilir</li>
                  <li>• Ticari amaçlı üyelik yasaktır</li>
                </ul>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">🔐 Hesap Sorumluluğu</h3>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>• Şifrenizi gizli tutmakla yükümlüsünüz</li>
                  <li>• Hesabınızdan yapılan işlemlerden sorumlusunuz</li>
                  <li>• Şüpheli aktiviteyi derhal bildirin</li>
                  <li>• Hesap paylaşımı yasaktır</li>
                  <li>• Yanlış bilgi verme hesap kapatma sebebidir</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Sipariş ve Satış */}
          <section id="siparis" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              3. Sipariş ve Satış Süreci
            </h2>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-900 mb-3">📝 Sipariş Süreci</h3>
                <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
                  <li>Ürün seçimi ve sepete ekleme</li>
                  <li>Teslimat ve fatura bilgilerinin girilmesi</li>
                  <li>Ödeme yönteminin seçilmesi</li>
                  <li>Ön bilgilendirme formunun onaylanması</li>
                  <li>Mesafeli satış sözleşmesinin kabulü</li>
                  <li>Siparişin tamamlanması ve onay e-postası</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-3">⚠️ Sipariş Koşulları</h3>
                  <ul className="text-sm text-red-800 space-y-2">
                    <li>• Stok durumuna göre siparişler onaylanır</li>
                    <li>• Fiyat hatalarında sipariş iptal edilebilir</li>
                    <li>• Sahte sipariş tespitinde hesap kapatılır</li>
                    <li>• Sipariş limitleri uygulanabilir</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-3">✅ Sipariş Onayı</h3>
                  <ul className="text-sm text-purple-800 space-y-2">
                    <li>• E-posta ile sipariş onayı gönderilir</li>
                    <li>• SMS ile kargo takip numarası iletilir</li>
                    <li>• Hesabınızdan sipariş durumunu takip edebilirsiniz</li>
                    <li>• İptal talepleri 24 saat içinde değerlendirilir</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Ödeme */}
          <section id="odeme" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              4. Ödeme ve Faturalandırma
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">💳 Ödeme Yöntemleri</h3>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>• Kredi kartı (Visa, MasterCard)</li>
                  <li>• Banka kartı</li>
                  <li>• Havale/EFT</li>
                  <li>• Kapıda ödeme (nakit/kart)</li>
                  <li>• Dijital cüzdan</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">🔒 Ödeme Güvenliği</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• 3D Secure doğrulama</li>
                  <li>• SSL şifreleme</li>
                  <li>• PCI-DSS uyumluluk</li>
                  <li>• Kart bilgileri saklanmaz</li>
                  <li>• Dolandırıcılık koruması</li>
                </ul>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-3">🧾 Fatura Bilgileri</h3>
                <ul className="text-sm text-orange-800 space-y-2">
                  <li>• E-fatura veya kağıt fatura</li>
                  <li>• KDV dahil fiyat gösterimi</li>
                  <li>• Kurumsal fatura seçeneği</li>
                  <li>• Fatura adresi zorunluluğu</li>
                  <li>• Yasal saklama süreleri</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Teslimat */}
          <section id="teslimat" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              5. Teslimat Koşulları
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left">Teslimat Türü</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Süre</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Ücret</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Özellikler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">Standart Kargo</td>
                    <td className="border border-gray-300 px-4 py-3">2-5 iş günü</td>
                    <td className="border border-gray-300 px-4 py-3">15 TL</td>
                    <td className="border border-gray-300 px-4 py-3">150 TL üzeri ücretsiz</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">Hızlı Kargo</td>
                    <td className="border border-gray-300 px-4 py-3">1-2 iş günü</td>
                    <td className="border border-gray-300 px-4 py-3">25 TL</td>
                    <td className="border border-gray-300 px-4 py-3">İstanbul, Ankara, İzmir</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">Aynı Gün Teslimat</td>
                    <td className="border border-gray-300 px-4 py-3">6-8 saat</td>
                    <td className="border border-gray-300 px-4 py-3">35 TL</td>
                    <td className="border border-gray-300 px-4 py-3">Seçili bölgeler, 500 TL üzeri</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">Mağazadan Teslim</td>
                    <td className="border border-gray-300 px-4 py-3">2-4 saat</td>
                    <td className="border border-gray-300 px-4 py-3">Ücretsiz</td>
                    <td className="border border-gray-300 px-4 py-3">Mağaza lokasyonları</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">📦 Teslimat Kuralları</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Teslimat adresinde mutlaka alıcı bulunmalı</li>
                <li>• Kimlik kontrolü yapılabilir</li>
                <li>• Hasarlı paket teslim alınmamalı</li>
                <li>• Teslimat saatleri: 09:00-18:00</li>
                <li>• Üç kez teslim denemesi yapılır</li>
              </ul>
            </div>
          </section>

          {/* 6. İade ve Değişim */}
          <section id="iade" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              6. İade ve Değişim Hakkı
            </h2>
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3">✅ İade Koşulları (14 Gün Cayma Hakkı)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">İade Edilebilir Ürünler:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Ambalajı açılmamış ürünler</li>
                      <li>• Hijyen açısından uygun olmayan ürünler hariç</li>
                      <li>• Kişiye özel üretilen ürünler hariç</li>
                      <li>• Teslim tarihinden itibaren 14 gün içinde</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">İade Süreci:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Online iade talebi oluşturma</li>
                      <li>• Kargo ile ücretsiz iade</li>
                      <li>• İnceleme süreci (2-5 iş günü)</li>
                      <li>• Onay sonrası 10 iş günü içinde ödeme iadesi</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-semibold text-red-900 mb-3">❌ İade Edilemeyen Ürünler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="text-sm text-red-800 space-y-2">
                    <li>• Gıda ve beslenme ürünleri</li>
                    <li>• Kişisel bakım ve hijyen ürünleri</li>
                    <li>• İç giyim ve mayo-bikini</li>
                    <li>• Mücevher ve değerli taşlar</li>
                  </ul>
                  <ul className="text-sm text-red-800 space-y-2">
                    <li>• Kitap, dijital içerik ve yazılım</li>
                    <li>• Kişiye özel üretilen ürünler</li>
                    <li>• Açılabilir ambalajı açılmış ürünler</li>
                    <li>• Kampanya ve indirimli ürünlerin bir kısmı</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Sorumluluklar */}
          <section id="sorumluluklar" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              7. Sorumluluk ve Yükümlülükler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">🏪 MutPark'ın Sorumlulukları</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Ürün bilgilerinin doğruluğu</li>
                  <li>• Güvenli ödeme altyapısı</li>
                  <li>• Zamanında teslimat</li>
                  <li>• Müşteri hizmetleri desteği</li>
                  <li>• Kişisel veri güvenliği</li>
                  <li>• Yasal yükümlülüklerin yerine getirilmesi</li>
                </ul>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-3">👤 Kullanıcının Sorumlulukları</h3>
                <ul className="text-sm text-orange-800 space-y-2">
                  <li>• Doğru bilgi verme</li>
                  <li>• Ödeme yükümlülüğü</li>
                  <li>• Ürünlerin uygun kullanımı</li>
                  <li>• Hesap güvenliğini sağlama</li>
                  <li>• Platform kurallarına uyma</li>
                  <li>• Yasadışı aktivitelerde bulunmama</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">⚖️ Sorumluluk Sınırlamaları</h3>
              <p className="text-sm text-gray-700 mb-4">
                MutPark, platformun kullanımından doğabilecek dolaylı zararlardan sorumlu değildir.
                Sorumluluk, ürün bedeli ile sınırlıdır. Mücbir sebep durumlarında yükümlülükler askıya alınabilir.
              </p>
              <p className="text-xs text-gray-600">
                Bu sınırlamalar, Türk hukuku uyarınca geçerli olan azami sınırlar dahilindedir.
              </p>
            </div>
          </section>

          {/* 8. Fikri Mülkiyet */}
          <section id="fikri-mulkiyet" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              8. Fikri Mülkiyet Hakları
            </h2>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-purple-900 mb-3">© Telif Hakları</h3>
                  <ul className="text-sm text-purple-800 space-y-2">
                    <li>• Web sitesi tasarımı ve içeriği</li>
                    <li>• Logo, marka ve slogan</li>
                    <li>• Ürün açıklamaları ve görseller</li>
                    <li>• Yazılım ve teknoloji</li>
                    <li>• Müzik ve video içerikler</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-3">🚫 Yasak Kullanımlar</h3>
                  <ul className="text-sm text-purple-800 space-y-2">
                    <li>• İçeriklerin kopyalanması</li>
                    <li>• Ticari amaçlı kullanım</li>
                    <li>• Tersine mühendislik</li>
                    <li>• Marka hakkı ihlali</li>
                    <li>• İzinsiz dağıtım</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 9. Gizlilik */}
          <section id="gizlilik" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              9. Gizlilik ve Kişisel Veriler
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-sm text-blue-800 mb-4">
                Kişisel verilerinizin işlenmesi, KVKK kapsamında ayrı bir gizlilik politikası ile düzenlenmektedir.
                Bu platformu kullanarak, gizlilik politikamızı okuduğunuzu ve kabul ettiğinizi beyan edersiniz.
              </p>
              <Link
                href={`/${locale}/legal/privacy`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                🛡️ Gizlilik Politikasını İncele
              </Link>
            </div>
          </section>

          {/* 10. Uyuşmazlık Çözümü */}
          <section id="uyusmazlik" className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-red-500 pl-4">
              10. Uyuşmazlık Çözümü ve Yürürlük
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-3">🤝 Alternatif Çözüm Yolları</h3>
                  <ul className="text-sm text-green-800 space-y-2">
                    <li>• Müşteri hizmetleri ile iletişim</li>
                    <li>• Tüketici hakem heyeti başvurusu</li>
                    <li>• Tüketici mahkemeleri</li>
                    <li>• Arabuluculuk sistemi</li>
                    <li>• Sektörel çözüm platformları</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">⚖️ Yasal Düzenlemeler</h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Türk hukuku uygulanır</li>
                    <li>• İstanbul mahkemeleri yetkilidir</li>
                    <li>• Tüketici mevzuatı önceliği</li>
                    <li>• KVKK ve veri koruma düzenlemeleri</li>
                    <li>• E-ticaret yönetmeliği</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-900 mb-3">📞 İletişim Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-yellow-800 mb-2"><strong>Müşteri Hizmetleri:</strong></p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• E-posta: destek@mutpark.com</li>
                      <li>• Telefon: 0850 XXX XX XX</li>
                      <li>• Canlı destek: 09:00-18:00</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-800 mb-2"><strong>Yasal İşler:</strong></p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• E-posta: hukuk@mutpark.com</li>
                      <li>• Posta: [Şirket Adresi]</li>
                      <li>• Çalışma saatleri: 09:00-17:00</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final Notice */}
          <section className="border-t border-gray-200 pt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-semibold text-red-900 mb-3">📋 Son Hükümler</h3>
              <div className="space-y-3 text-sm text-red-800">
                <p>
                  Bu kullanım şartları, MutPark E-Ticaret A.Ş. ile müşteri arasındaki ilişkiyi düzenler.
                  Şartların herhangi bir bölümünün geçersiz sayılması, diğer bölümlerin geçerliliğini etkilemez.
                </p>
                <p>
                  Bu şartlar Türkçe olarak düzenlenmiştir. Diğer dillerdeki çeviriler yalnızca referans amaçlıdır.
                  Uyuşmazlık durumunda Türkçe metin geçerlidir.
                </p>
                <p className="font-medium">
                  Son güncelleme: {new Date().toLocaleDateString('tr-TR')} |
                  Versiyon: 1.0 |
                  Yürürlük tarihi: {new Date().toLocaleDateString('tr-TR')}
                </p>
              </div>
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
                href={`/${locale}/legal/privacy`}
                className="btn-outline"
              >
                🛡️ Gizlilik Politikası
              </Link>
              <Link
                href={`/${locale}/kvkk-basvuru`}
                className="btn-primary"
              >
                📝 KVKK Başvuru
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}