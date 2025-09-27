"use client";

import Link from "next/link";
import { useI18n } from "@/providers/I18nProvider";
import { useEffect, useState } from "react";

// Korean seasonal data
const koreanSeasons = {
  spring: {
    name: { ko: "봄", en: "Spring", tr: "İlkbahar" },
    colors: "from-pink-400 via-rose-500 to-pink-600",
    accent: "text-pink-100",
    button: "text-pink-600",
    features: { ko: "벚꽃 시즌 특선", en: "Cherry Blossom Specials", tr: "Kiraz Çiçeği Özel Ürünleri" },
    pattern: "🌸",
    textColor: "text-white",
  },
  summer: {
    name: { ko: "여름", en: "Summer", tr: "Yaz" },
    colors: "from-emerald-500 via-emerald-600 to-emerald-700",
    accent: "text-emerald-100",
    button: "text-emerald-600",
    features: { ko: "시원한 여름 간식", en: "Cool Summer Treats", tr: "Serinletici Yaz Lezzetleri" },
    pattern: "☀️",
    textColor: "text-white",
  },
  autumn: {
    name: { ko: "가을", en: "Autumn", tr: "Sonbahar" },
    colors: "from-amber-500 via-orange-500 to-red-600",
    accent: "text-orange-100",
    button: "text-orange-600",
    features: { ko: "가을 단풍 축제", en: "Autumn Harvest Festival", tr: "Sonbahar Hasat Festivali" },
    pattern: "🍂",
    textColor: "text-white",
  },
  winter: {
    name: { ko: "겨울", en: "Winter", tr: "Kış" },
    colors: "from-blue-600 via-indigo-700 to-purple-800",
    accent: "text-blue-100",
    button: "text-blue-600",
    features: { ko: "따뜻한 겨울 요리", en: "Warm Winter Dishes", tr: "Sıcak Kış Yemekleri" },
    pattern: "❄️",
    textColor: "text-white",
  },
};

// Korean cultural events by month
const koreanCulturalEvents = [
  { month: 0, name: { ko: "설날 준비", en: "New Year Preparation", tr: "Yeni Yıl Hazırlığı" }, pattern: "🎊" },
  { month: 1, name: { ko: "설날", en: "Korean New Year", tr: "Kore Yeni Yılı" }, pattern: "🧧" },
  { month: 2, name: { ko: "삼일절", en: "Independence Day", tr: "Bağımsızlık Günü" }, pattern: "🇰🇷" },
  { month: 3, name: { ko: "벚꽃축제", en: "Cherry Blossom Festival", tr: "Kiraz Çiçeği Festivali" }, pattern: "🌸" },
  { month: 4, name: { ko: "어린이날", en: "Children's Day", tr: "Çocuklar Günü" }, pattern: "🎈" },
  { month: 5, name: { ko: "단오", en: "Dano Festival", tr: "Dano Festivali" }, pattern: "🌿" },
  { month: 6, name: { ko: "여름축제", en: "Summer Festival", tr: "Yaz Festivali" }, pattern: "🎆" },
  { month: 7, name: { ko: "광복절", en: "Liberation Day", tr: "Kurtuluş Günü" }, pattern: "🎌" },
  { month: 8, name: { ko: "추석", en: "Harvest Festival", tr: "Hasat Festivali" }, pattern: "🌕" },
  { month: 9, name: { ko: "한글날", en: "Hangeul Day", tr: "Hangeul Günü" }, pattern: "📝" },
  { month: 10, name: { ko: "김장", en: "Kimchi Making", tr: "Kimchi Yapımı" }, pattern: "🥬" },
  { month: 11, name: { ko: "겨울축제", en: "Winter Festival", tr: "Kış Festivali" }, pattern: "❄️" },
];

function getCurrentSeason(): keyof typeof koreanSeasons {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

function getCurrentCulturalEvent() {
  const month = new Date().getMonth();
  return koreanCulturalEvents[month];
}

export function HeroSection({ locale }: { locale: string }) {
  const { t } = useI18n();
  const [currentSeason, setCurrentSeason] = useState<keyof typeof koreanSeasons>("summer");
  const [culturalEvent, setCulturalEvent] = useState(koreanCulturalEvents[6]);

  useEffect(() => {
    setCurrentSeason(getCurrentSeason());
    setCulturalEvent(getCurrentCulturalEvent());
  }, []);

  const season = koreanSeasons[currentSeason];
  const eventName = culturalEvent.name[locale as keyof typeof culturalEvent.name] || culturalEvent.name.en;
  const seasonName = season.name[locale as keyof typeof season.name] || season.name.en;
  const seasonFeatures = season.features[locale as keyof typeof season.features] || season.features.en;

  return (
    <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${season.colors} px-6 py-16 ${season.textColor} shadow-xl`}>
      {/* Animated seasonal pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-4 -right-4 text-6xl opacity-10 animate-bounce">
          {season.pattern}
        </div>
        <div className="absolute top-1/2 -left-8 text-4xl opacity-5 animate-pulse">
          {culturalEvent.pattern}
        </div>
        <div className="absolute bottom-4 right-1/4 text-5xl opacity-5 animate-bounce delay-1000">
          {season.pattern}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl">
        {/* Seasonal Badge */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{season.pattern}</span>
          <div className={`text-sm uppercase tracking-wide ${season.accent} flex items-center gap-2`}>
            <span>MutPark</span>
            <span>•</span>
            <span>{seasonName}</span>
          </div>
          <span className="text-xl">{culturalEvent.pattern}</span>
        </div>

        {/* Cultural Event Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6`}>
          <span className="text-lg">{culturalEvent.pattern}</span>
          <span className="text-sm font-medium">{eventName}</span>
        </div>

        {/* Main Content */}
        <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl leading-tight">
          {t("hero.title")}
        </h1>
        <p className={`mt-4 text-lg lg:text-xl ${season.accent} max-w-2xl`}>
          {t("hero.subtitle")}
        </p>

        {/* Seasonal Features */}
        <p className={`mt-3 text-base ${season.accent} font-medium`}>
          {seasonFeatures}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={`/${locale}/products`}
            className={`group relative overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold ${season.button} shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {t("hero.ctaShop")}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </Link>
          <Link
            href={`/${locale}/recipes`}
            className="group rounded-full border-2 border-white/70 px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-white hover:shadow-lg"
          >
            <span className="flex items-center gap-2">
              {t("hero.ctaRecipes")}
              <span className="text-lg">{culturalEvent.pattern}</span>
            </span>
          </Link>
        </div>

        {/* Korean Cultural Elements */}
        <div className="mt-8 flex flex-wrap gap-6 text-sm opacity-80">
          <div className="flex items-center gap-2">
            <span>🥢</span>
            <span>{locale === 'ko' ? '정통 한식' : locale === 'tr' ? 'Otantik Kore Mutfağı' : 'Authentic Korean Cuisine'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{locale === 'ko' ? '할랄 인증' : locale === 'tr' ? 'Helal Sertifikalı' : 'Halal Certified'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🚚</span>
            <span>{locale === 'ko' ? '터키 전국배송' : locale === 'tr' ? 'Türkiye Geneli Teslimat' : 'Turkey-wide Delivery'}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Background Elements */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-white/10 blur-3xl animate-pulse delay-1000" />
      <div className="pointer-events-none absolute top-1/2 left-0 h-32 w-32 rounded-full bg-white/5 blur-2xl animate-pulse delay-500" />

      {/* Traditional Korean Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="korean-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.3" />
            <path d="M5,5 Q10,8 15,5 Q10,12 5,15 Q10,12 15,15" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#korean-pattern)" />
        </svg>
      </div>
    </section>
  );
}
