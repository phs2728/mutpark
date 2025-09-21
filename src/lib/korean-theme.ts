// 한국 전통 색상 팔레트
export const koreanColors = {
  // 오방색 (전통 오색)
  traditional: {
    red: '#C62A2F',      // 적색 (남쪽, 여름, 불)
    blue: '#003D82',     // 청색 (동쪽, 봄, 나무)
    yellow: '#FFD700',   // 황색 (중앙, 늦여름, 흙)
    white: '#FEFEFE',    // 백색 (서쪽, 가을, 금속)
    black: '#2C2C2C',    // 흑색 (북쪽, 겨울, 물)
  },

  // 궁궐 색상
  palace: {
    dancheong: '#E74C3C',    // 단청 빨강
    dancheongBlue: '#3498DB', // 단청 파랑
    dancheongGreen: '#27AE60', // 단청 초록
    gold: '#F39C12',         // 금색
    jade: '#16A085',         // 옥색
  },

  // 자연색 (계절감)
  nature: {
    spring: {
      cherry: '#FFB6C1',     // 벚꽃
      newLeaf: '#90EE90',    // 새잎
      sky: '#87CEEB',        // 봄하늘
    },
    summer: {
      lotus: '#FFB6C1',      // 연꽃
      bamboo: '#228B22',     // 대나무
      watermelon: '#FF6B6B', // 수박
    },
    autumn: {
      maple: '#CD853F',      // 단풍
      persimmon: '#FF7F50',  // 감
      ginkgo: '#FFD700',     // 은행
    },
    winter: {
      snow: '#F8F8FF',       // 눈
      pine: '#2F4F4F',       // 소나무
      plum: '#DDA0DD',       // 매화
    }
  },

  // 음식 색상
  food: {
    kimchi: '#DC143C',       // 김치 빨강
    soybean: '#DEB887',      // 콩 색
    rice: '#F5F5DC',         // 쌀 색
    seaweed: '#2F4F2F',      // 김 색
    gochugaru: '#FF4500',    // 고춧가루
  }
};

// 계절별 테마
export const seasonalThemes = {
  spring: {
    primary: koreanColors.nature.spring.cherry,
    secondary: koreanColors.nature.spring.newLeaf,
    background: '#FFF8F8',
    text: koreanColors.traditional.black,
    accent: koreanColors.traditional.red,
    gradient: 'from-pink-50 to-green-50',
    emoji: '🌸',
    name: '봄 (벚꽃)'
  },
  summer: {
    primary: koreanColors.nature.summer.lotus,
    secondary: koreanColors.nature.summer.bamboo,
    background: '#F0FFF0',
    text: koreanColors.traditional.black,
    accent: koreanColors.traditional.blue,
    gradient: 'from-green-50 to-blue-50',
    emoji: '🌿',
    name: '여름 (연꽃)'
  },
  autumn: {
    primary: koreanColors.nature.autumn.maple,
    secondary: koreanColors.nature.autumn.persimmon,
    background: '#FFF8DC',
    text: koreanColors.traditional.black,
    accent: koreanColors.traditional.yellow,
    gradient: 'from-orange-50 to-yellow-50',
    emoji: '🍂',
    name: '가을 (단풍)'
  },
  winter: {
    primary: koreanColors.nature.winter.plum,
    secondary: koreanColors.nature.winter.pine,
    background: '#F8F8FF',
    text: koreanColors.traditional.black,
    accent: koreanColors.traditional.blue,
    gradient: 'from-blue-50 to-purple-50',
    emoji: '❄️',
    name: '겨울 (매화)'
  }
};

// 현재 계절 감지
export function getCurrentSeason(): keyof typeof seasonalThemes {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return 'spring';   // 3-5월
  if (month >= 6 && month <= 8) return 'summer';   // 6-8월
  if (month >= 9 && month <= 11) return 'autumn';  // 9-11월
  return 'winter'; // 12-2월
}

// 한국 문화 아이콘/이모지
export const koreanEmojis = {
  food: ['🍚', '🥢', '🍜', '🥟', '🍲', '🧄', '🌶️'],
  culture: ['🏮', '🎋', '🎎', '👘', '🏯', '⛩️'],
  nature: ['🌸', '🍂', '❄️', '🌿', '🏔️', '🌊'],
  celebration: ['🎉', '🎊', '🎈', '🎁', '🎂', '🍾'],
  activities: ['🥋', '🎭', '🎨', '📚', '🎵', '🕯️']
};

// 친근한 한국어 톤앤매너
export const koreanTones = {
  friendly: [
    '안녕하세요!', '반가워요!', '좋아요!', '최고예요!',
    '대박!', '짱이에요!', '멋져요!', '고마워요!'
  ],
  encouraging: [
    '화이팅!', '잘하셨어요!', '멋져요!', '대단해요!',
    '최고예요!', '훌륭해요!', '좋은 아이디어네요!', '감사해요!'
  ],
  casual: [
    '그렇네요', '맞아요', '좋겠어요', '재밌어요',
    '신기해요', '따뜻해요', '맛있겠어요', '예뻐요'
  ]
};

// 계절별 메시지
export const seasonalMessages = {
  spring: [
    '따뜻한 봄이 왔어요! 🌸',
    '새로운 시작의 계절이네요',
    '꽃피는 춘삼월입니다',
    '봄나물로 건강 챙기세요'
  ],
  summer: [
    '더운 여름, 시원한 음식 어때요? 🍉',
    '여름 보양식으로 기력 충전하세요',
    '시원한 냉면 생각나는 날씨네요',
    '무더위 조심하세요'
  ],
  autumn: [
    '가을 정취가 물씬 느껴져요 🍂',
    '추수감사의 계절입니다',
    '단풍 구경 가기 좋은 날씨예요',
    '김장철이 다가오네요'
  ],
  winter: [
    '따뜻한 국물이 그리운 겨울이에요 ❄️',
    '김치찌개로 몸 따뜻하게 하세요',
    '연말연시 준비는 잘 되세요?',
    '따뜻한 차 한 잔 어때요?'
  ]
};

// 테마 적용 함수
export function getSeasonalTheme() {
  const currentSeason = getCurrentSeason();
  return seasonalThemes[currentSeason];
}

// 랜덤 한국 문화 요소 가져오기
export function getRandomKoreanElement(category: keyof typeof koreanEmojis) {
  const elements = koreanEmojis[category];
  return elements[Math.floor(Math.random() * elements.length)];
}

// 랜덤 친근한 메시지
export function getRandomFriendlyMessage() {
  const currentSeason = getCurrentSeason();
  const seasonalMsgs = seasonalMessages[currentSeason];
  return seasonalMsgs[Math.floor(Math.random() * seasonalMsgs.length)];
}

// CSS 변수로 테마 적용
export function applyKoreanTheme() {
  const theme = getSeasonalTheme();

  document.documentElement.style.setProperty('--korean-primary', theme.primary);
  document.documentElement.style.setProperty('--korean-secondary', theme.secondary);
  document.documentElement.style.setProperty('--korean-background', theme.background);
  document.documentElement.style.setProperty('--korean-text', theme.text);
  document.documentElement.style.setProperty('--korean-accent', theme.accent);
}