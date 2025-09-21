'use client';

import { useState, useEffect } from 'react';
import { getSeasonalTheme, getRandomFriendlyMessage, getRandomKoreanElement } from '@/lib/korean-theme';

export default function KoreanCulturalHeader() {
  const [theme, setTheme] = useState(getSeasonalTheme());
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [culturalIcon, setCulturalIcon] = useState('');

  useEffect(() => {
    setTheme(getSeasonalTheme());
    setWelcomeMessage(getRandomFriendlyMessage());
    setCulturalIcon(getRandomKoreanElement('culture'));
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${theme.gradient} border-2 border-opacity-20 p-6 mb-6`}
         style={{ borderColor: theme.primary }}>

      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-12 gap-4 h-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="text-2xl">
              {getRandomKoreanElement('culture')}
            </div>
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{theme.emoji}</div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
                한국 음식 커뮤니티 {culturalIcon}
              </h1>
              <p className="text-lg opacity-80" style={{ color: theme.text }}>
                {welcomeMessage}
              </p>
            </div>
          </div>

          {/* 계절 표시 */}
          <div className="text-right">
            <div className="text-sm opacity-70" style={{ color: theme.text }}>
              현재 테마
            </div>
            <div className="text-lg font-semibold flex items-center space-x-2" style={{ color: theme.accent }}>
              <span>{theme.emoji}</span>
              <span>{theme.name}</span>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="mt-4 pt-4 border-t border-opacity-20" style={{ borderColor: theme.primary }}>
          <div className="flex items-center justify-between text-sm opacity-80" style={{ color: theme.text }}>
            <div className="flex items-center space-x-6">
              <span>🍚 터키에서 즐기는 한국의 맛</span>
              <span>🤝 따뜻한 마음을 나누는 공간</span>
              <span>💡 생활 꿀팁과 레시피 공유</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>함께해요</span>
              <span>{getRandomKoreanElement('celebration')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}