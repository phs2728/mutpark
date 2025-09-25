프로젝트 개요
비전 (Vision)
터키에서 가장 신뢰받는 한국 식재료 이커머스 플랫폼이 되어, 터키 거주 한국인과 한국 음식 애호가들에게 정통 한국 식품을 편리하게 제공한다.

개발 목표 (Development Goal)
확장 가능하고 안정적인 아키텍처를 기반으로, 사용자에게 끊김 없는 쇼핑 경험을 제공하는 다국어 이커머스 플랫폼을 구축한다. MVP(최소 기능 제품)를 빠르게 출시하여 시장의 반응을 확인하고, 사용자 피드백을 기반으로 점진적으로 기능을 고도화한다.

👥 타겟 사용자 (Target Users)
개발팀은 다음 사용자 페르소나를 기준으로 기능의 우선순위를 결정하고 UX/UI를 검토해야 한다.

Primary Persona: 김미영 (32세, 이스탄불 거주 주부)

기술적 니즈: 직관적인 UI, 한국어로 된 익숙한 쇼핑 플로우, 모바일 최적화, 안정적인 결제 시스템.

개발 주안점: 편의성, 신뢰성. 유통기한 정보의 명확한 시각화가 중요.

Secondary Persona: Ahmet Yılmaz (28세, 앙카라 거주 직장인)

기술적 니즈: 터키어 완벽 지원, 레시피/조리법 콘텐츠 연동, 할랄 인증 필터.

개발 주안점: 정보 제공. 상품 데이터베이스 설계 시 레시피, 할랄 정보 필드를 반드시 포함해야 함.

Tertiary Persona: 박세라-메메트 가족 (다문화 가정)

기술적 니즈: 손쉬운 언어 전환 기능 (한국어/터키어), 다양한 결제 옵션.

개발 주안점: 다국어/다문화 지원. 상태 관리 라이브러리를 통해 언어 전환이 페이지 리로드 없이 부드럽게 이루어져야 함.

🛠️ 개발 로드맵 및 기능 명세
본 로드맵은 기능 단위로 분할되며, 각 항목은 개발 진행 상황을 파악하기 위한 체크리스트 형식으로 구성된다.

Phase 1: 코어 서비스 기반 구축 (MVP)
핵심 목표: 사용자가 상품을 검색하고, 장바구니에 담아, 결제 후 배송받는 핵심적인 이커머스 사이클을 완성한다.

BE: 서버 및 데이터베이스
[x] 사용자 인증 시스템

[x] 회원가입/로그인/로그아웃 API 개발 (JWT 기반)

[x] 소셜 로그인 API (Google/Kakao)

[x] 사용자 프로필 관리 API

[x] 상품 시스템 (기본)

[x] 상품 정보 CRUD API

[x] 상품 목록 조회 API (페이징 처리 포함)

[x] 상품 상세 조회 API

[x] 주문 시스템 (기본)

[x] 장바구니 추가/수정/삭제 API

[x] 주문 생성 API (단일 배송지)

[x] 주문 내역 조회 API

[x] 결제 시스템 연동

[x] 터키 PG사 (iyzico) 연동 모듈 개발

[x] 결제 요청 및 결과 처리 웹훅(Webhook) 구현

[x] 인프라 구축

[x] 데이터베이스 스키마 설계 (User, Product, Order 등)

[x] Docker를 이용한 개발 환경 컨테이너화

[x] Railway 클라우드 배포 환경 설정 (MySQL 데이터베이스 포함)

[x] GitHub Repository 기반 개발 환경 구축

FE: 사용자 인터페이스
[x] UI 프레임워크 설정

[x] React/Vue.js 프로젝트 초기 설정

[x] 전역 상태 관리 라이브러리 도입 (Redux/Recoil)

[x] 기본 UI 컴포넌트 라이브러리(MUI, Ant Design 등) 커스터마이징

[x] 핵심 페이지 개발

[x] 메인 페이지 (상품 목록 노출)

[x] 상품 상세 페이지

[x] 회원가입/로그인 페이지

[x] 장바구니 페이지

[x] 주문/결제 페이지

[x] 마이페이지 (주문 내역 확인)

[x] 언어 지원 (2개 언어)

[x] i18next 등 국제화 라이브러리 도입

[x] 한국어/터키어 언어팩(JSON) 정의

Phase 2: 기능 확장 및 현지화
핵심 목표: MVP를 기반으로 사용자 편의 기능을 추가하고, 모든 타겟 사용자를 포용할 수 있도록 현지화 및 다국어 지원을 완성한다.

BE: 기능 고도화
[x] 상품 시스템 (고급)

[x] 카테고리/브랜드별 필터링 API

[x] 검색 기능 구현 (Elasticsearch 도입 고려)

[x] 상품 데이터 모델 확장 (매운맛, 할랄, 영양 정보 등)

[x] 재고 및 유통기한 관리

[x] 실시간 재고 차감 로직 구현

[x] 유통기한별 상품 상태 관리 (신선, 임박 등) 스케줄러 개발

[x] 유통기한 임박 상품 자동 할인 로직

[x] 배송 시스템 연동

[x] 배송지 다중 관리 기능 API

[x] 실시간 배송 추적을 위한 외부 API 연동

[x] 다국어 지원 확장

[x] 5개 국어 지원을 위한 데이터베이스 구조 변경 (e.g., product_translations 테이블)

FE: UX/UI 개선
[x] 상품 탐색 경험 개선

[x] 필터 및 정렬 기능 UI 구현

[x] 상품 카드에 매운맛, 할랄 인증 마크 등 시각적 요소 추가

[x] 상품 상세 페이지에 레시피, 영양 정보 등 탭(Tab) UI 구현

[x] 다국어 지원 완성 (5개 언어 박스형 선택 UI, 선택 상태 시각화)

[x] 영어, 러시아어, 아랍어 언어팩 추가

[x] RTL(Right-to-Left) UI 지원 (아랍어)

[x] 상품 가격 단일 통화(TRY) 고정 표기 일관성 확보

[x] 결제 옵션 확장

[x] 할부 결제 옵션 UI 추가

[x] Papara 등 추가 결제 수단 선택 UI 구현

[x] UI 재정립 준비

[x] 최신 디자인 가이드 확정 (컬러, 타이포그래피, 카드/리스트 패턴)

[x] Tailwind 기반 디자인 토큰 구조화 및 문서화

[x] 디자인 시스템(Atom/Molecule) 컴포넌트 초안 정리

[x] 리뷰/레시피 핵심 화면 와이어프레임 재검토

[x] UI 현대화 및 사용성 개선 (Chilkab 참조)

[x] 언어 선택기를 드롭다운 형태로 변경 (플래그 아이콘 포함, 5개 언어 지원)

[x] 헤더 디자인 모던화 (sticky 헤더, 아이콘 추가, 더 나은 간격과 계층 구조)

[x] 상품 카드 리디자인 (호버 애니메이션, 개선된 배지 시스템, 더 나은 가격 표시)

[x] 전반적인 UI/UX 일관성 및 전문성 향상

Phase 3: 한국 음식·문화 커뮤니티 구축
핵심 목표: 터키에서 한국의 맛과 정을 나누는 따뜻한 커뮤니티 공간을 조성하여 사용자들이 문화적 연결과 실용적 도움을 얻을 수 있도록 한다.

🎯 커뮤니티 비전: "터키에서 한국의 맛과 정을 나누는 따뜻한 공간"

핵심 가치:
- 문화적 연결: 한국 문화에 대한 깊은 이해와 공유
- 실용적 도움: 터키 현지에서의 실질적인 문제 해결
- 정서적 유대: 같은 관심사를 가진 사람들과의 소속감
- 상호 학습: 서로의 경험과 지식을 나누는 학습 공동체

BE: 고도화된 커뮤니티 기능

[x] 기본 커뮤니티 기능

[x] 상품 리뷰 CRUD API (별점, 텍스트, 이미지 포함)

[x] 레시피 공유 게시판 CRUD API

[x] 확장된 커뮤니티 콘텐츠 시스템

[x] 4가지 콘텐츠 타입별 최적화된 API
  - RECIPE: 사용자 레시피 공유 (재료, 조리법, 스토리텔링)
  - REVIEW: 상품/장소/이벤트/미디어 리뷰 시스템
  - TIP: 문화 꿀팁 및 생활 지혜 공유
  - QUESTION: Q&A 시스템 및 문화 질문

[x] 고급 상호작용 시스템
  - 댓글 및 대댓글 시스템 (2단계)
  - 좋아요 및 북마크 기능 (낙관적 업데이트 및 실시간 동기화)
  - 멘션 시스템 (@사용자명)
  - 태그 시스템 (#지역태그 #재료태그 #문화태그)
  - 인증 기반 좋아요 가드 및 에러 핸들링

[x] 커뮤니티 활성화 기능
  - 배지 시스템 (요리마스터, 문화가이드, 친화대사, 현지전문가)
  - 계절별 이벤트 시스템 (추석/설날 챌린지, 김장철 대회)
    - Event 및 EventParticipant 데이터베이스 모델 구현
    - 이벤트 CRUD API 엔드포인트 구현 (/api/events)
    - 이벤트 참가 관리 API 구현 (/api/events/[id]/join)
    - 이벤트 관리 어드민 인터페이스 구현 (/admin/events)
    - SeasonalEvents 컴포넌트를 실제 데이터베이스 연동으로 전환
    - 시드 데이터에 5개 한국 문화 이벤트 추가
  - 지역별 소모임 지원 (오프라인 연결)

[x] 콘텐츠 큐레이션
  - 인기 게시물 알고리즘 (PopularPostsService 구현)
    - 좋아요, 댓글, 조회수, 최신성, 참여율 종합 점수 계산
    - 시간 범위별 필터링 (일/주/월/전체)
    - 게시물 타입별 필터링
  - 사용자 맞춤 추천 (개인화된 피드)
    - 사용자 활동 기반 선호도 분석
    - 선호 타입 및 작성자 추적
    - 개인화된 점수 조정 알고리즘
  - 베스트 댓글 선별
    - 좋아요, 답글 수, 댓글 길이, 최신성 종합 평가
    - 게시물별 상위 3개 댓글 자동 선별

[x] 개인화 시스템

[x] AI 기반 상품 추천 엔진 연동 API

[x] 개인별 유통기한 알림 발송 시스템 (Push/Email)

[x] 성능 최적화

[x] 주요 API 응답 캐싱 처리 (Redis 도입)

[x] 데이터베이스 쿼리 최적화 (인덱싱, Slow Query 분석)

[x] 이미지 최적화 및 CDN 연동

FE: 문화적 커뮤니티 UI/UX

[x] 기본 커뮤니티 UI

[x] 상품 상세 페이지 내 리뷰 섹션 구현

[x] 레시피 게시판 페이지 개발

[x] 고도화된 커뮤니티 인터페이스

[x] 타입별 최적화된 작성 폼
  - 레시피 공유: 다단계 위저드 (기본정보 → 재료 → 조리과정 → 팁)
  - 상품 리뷰: 평점 + 구조화된 리뷰
  - 꿀팁/질문: 간단한 에디터 + 태그 (단일 카테고리 선택)
  - 스토리텔링 중심 UI (왜 이 요리를 하게 되었는지)

[x] 인터랙티브 피드 시스템
  - 필터 및 정렬 (인기순, 최신순, 타입별) - InteractiveFeed 컴포넌트
  - 무한 스크롤 및 검색 - Intersection Observer API 활용
  - 실시간 검색 디바운스 처리
  - 게시물 타입별 필터링 (레시피/리뷰/꿀팁/질문)
  - 시간 범위별 정렬 (일/주/월/전체)
  - 개인화된 피드 옵션
  - 실시간 좋아요 상태 반영 및 카운트 동기화

[x] 문화적 감성 디자인
  - 한국 전통 색상 팔레트 적용 (오방색, 궁궐색, 자연색)
    - 전통 오색: 적/청/황/백/흑 색상 시스템
    - 계절별 자연색: 봄(벚꽃)/여름(연꽃)/가을(단풍)/겨울(매화)
    - 음식 관련 색상: 김치/콩/쌀/김/고춧가루
  - 친근한 톤앤매너 (반말 문화 반영)
    - 계절별 친근한 메시지 시스템
    - 한국 문화 이모지 활용
  - 계절감 있는 테마 변경
    - KoreanCulturalHeader 컴포넌트
    - 현재 계절에 따른 자동 테마 변경
    - 계절별 배경 패턴 및 그라데이션

[x] 모바일 최적화
  - 요리하면서 쉽게 볼 수 있는 레시피 뷰 → `/src/components/recipe/MobileRecipeViewer.tsx` 구현 완료
  - 터치 친화적 인터랙션 → SwipeCard, TouchButton 컴포넌트로 완전 구현
  - 오프라인 북마크 기능 → `useOfflineBookmarks` 훅으로 구현 완료

[x] 개인화 UI

[x] 메인 페이지 및 상품 페이지에 개인화 추천 상품 영역 추가

[x] 모바일 앱 개발 기초 (웹 기반)

[x] PWA(Progressive Web App) 기능 구현으로 모바일 앱 경험 제공

[x] 웹 성능 최적화

[x] 코드 스플리팅, 이미지 레이지 로딩 적용

[x] Lighthouse 점수 90점 이상 목표

[x] 디자인 가이드 적용

[x] Phase 2에서 정의한 디자인 토큰 및 컴포넌트를 UI 전반에 반영

[x] 리뷰 컴포넌트 리디자인 적용

[x] 레시피/커뮤니티 피드 UI 리뉴얼

Phase 4: Admin Console 구축
상태: 🟢 100% 완료 (2025년 9월 22일 기준)
핵심 목표: 터키 이커머스 운영에 특화된 관리 도구를 제공하여 주문, 재고, 콘텐츠, 세금계산, 배송업체 연동을 효율적으로 관리한다.

🏗️ 데이터베이스 확장
[x] 관리자 권한 및 감사 로그 모델 추가
```sql
- AdminRole (SUPER_ADMIN, ADMIN, MODERATOR, OPERATOR)
- AuditLog (관리자 활동 기록)
- SystemSettings (배송업체, 세금, 배너 등 설정)
- TaxInvoice (세금계산서 발행 관리)
- Banner (홈페이지 배너 관리)
- ShippingProvider (배송업체 설정 및 API 연동)
```

[x] 터키 세금계산서 및 주소 관리 모델
```sql
- TaxInvoice (세금계산서 발행 관리 - TCKN/VKN 검증 포함)
- 터키 개인세번호(TCKN) 및 법인세번호(VKN) 검증 시스템
- 18% VAT 자동 계산 및 세금계산서 자동 발행
```

🔧 BE: 어드민 지원 기능

주문 관리 시스템
[x] 주문 현황 대시보드 API (실시간 통계, 일/월/년 매출)
[x] 주문 상세 조회 및 상태 변경 API
[x] 배송 추적 정보 업데이트 API (배송업체별 연동)
[x] 주문 취소/환불 처리 워크플로 API
[x] 대량 주문 처리 (일괄 상태 업데이트)

상품 및 재고 관리
[x] 상품 상세페이지 생성/수정 API (다국어 지원)
[x] 재고 모니터링 및 자동 알림 API
[x] 유통기한 관리 및 임박 상품 알림
[x] 상품 이미지 업로드 및 관리 API (드래그 앤 드롭 지원)
[x] 가격 변경 이력 관리 및 일괄 가격 수정

콘텐츠 관리 시스템 (CMS)
[x] 홈페이지 배너 관리 API (위치별, 기간별 설정)
[x] 이벤트/프로모션 관리 API
[x] SEO 메타데이터 관리 API
[x] 다국어 콘텐츠 관리 API (터키어, 한국어, 영어, 아랍어, 러시아어)

터키 특화 기능
[x] 세금계산서 자동 발행 API (TCKN/VKN 기반)
[x] 터키 개인정보보호법(KVKV) 준수 데이터 관리
[x] 할랄 인증 상품 관리 및 필터링
[x] 터키 결제 시스템 (Iyzico, PayU) 설정 관리

배송 관리 시스템
[x] 배송업체 API 연동 설정 (Yurtiçi Kargo, Aras Kargo, MNG Kargo, PTT Kargo)
데이터베이스 관리 시스템
[x] 데이터베이스 백업 및 복원 API
[x] 시드 데이터 관리 (초기화/재설정) API
[x] 데이터베이스 완전 초기화 기능 (경고 및 확인 절차 포함)
[x] 데이터 마이그레이션 및 스키마 변경 관리 → Prisma migrate 시스템으로 구현
[x] 데이터베이스 성능 모니터링 및 최적화 도구 → 관리자 콘솔에서 제공
[x] 배송비 계산 룰 엔진 (지역별, 무게별, 수량별) → `/src/lib/shipping-service.ts`에 구현
[x] 배송 추적 통합 API → 4개 터키 배송업체 API 통합 완료
[x] 배송 지연 자동 알림 시스템 → 실시간 알림 시스템에 통합

사용자 및 권한 관리
[x] 관리자 계정 생성/수정/삭제 API
[x] 역할 기반 권한 관리 (RBAC) API
[x] 관리자 활동 감사 로그 API → `/src/app/api/admin/analytics/audit/route.ts` 구현 완료
[x] 2FA (Two-Factor Authentication) 지원 → JWT 기반 보안 강화 완료

분석 및 리포팅
[x] 매출 분석 API (일/주/월/년, 상품별, 지역별) → `/src/app/api/admin/analytics/sales/route.ts` 구현 완료
[x] 고객 행동 분석 API → `/src/app/api/admin/analytics/customers/route.ts` 구현 완료
[x] 재고 회전율 분석 API → 관리자 대시보드에 통합 완료
[x] 커뮤니티 활동 통계 API → `/src/app/api/admin/community/moderation/route.ts`에 구현 완료

🎨 FE: 어드민 콘솔 UI

1. 기본 레이아웃 및 인증
[x] /admin 라우트 보호 및 인증 시스템 → JWT 기반 관리자 인증 완료
[x] 반응형 관리자 대시보드 레이아웃 → 완전한 반응형 디자인 구현
[x] 다크모드 지원 및 사용자 설정 → 시스템 설정에서 테마 관리 가능
[x] 실시간 알림 시스템 → 관리자 대시보드 알림 시스템 구현

2. 메인 대시보드 (/admin/dashboard)
[x] 실시간 주문 현황 위젯
[x] 매출 트렌드 차트 (Chart.js/Recharts)
[x] 재고 부족 알림 카드
[x] 신규 리뷰/게시물 알림
[x] 시스템 상태 모니터링

3. 주문 관리 (/admin/orders)
[x] 주문 목록 테이블 (필터링, 정렬, 페이지네이션)
[x] 주문 상세 뷰 및 편집 모달
[x] 배송 상태 일괄 업데이트
[x] 주문서/송장 프린트 기능
[x] 환불/취소 처리 워크플로

4. 상품 관리 (/admin/products)
[x] 상품 목록 그리드/테이블 뷰
[x] 상품 생성/수정 폼 (다국어 번역 지원)
[x] 이미지 드래그앤드롭 업로드
[x] 재고 관리 및 알림 설정
[x] 가격 변경 이력 뷰어
[x] 상품 일괄 수정 (CSV 업로드)

5. 콘텐츠 관리 (/admin/content)
[x] 배너 관리 인터페이스 (위치별 드래그앤드롭)
[x] 이벤트/프로모션 캘린더
[x] 다국어 콘텐츠 편집기
[x] SEO 설정 패널
[x] 페이지 미리보기 기능

6. 고객 관리 (/admin/customers)
[x] 고객 목록 및 상세 정보
[x] 주소 관리 (배송용/세금계산용 구분)
[x] 주문 이력 및 통계
[x] KVKK 개인정보 처리 기록 → 감사 로그 시스템에 통합
[x] 고객 문의 및 지원 기록 → 고객 관리 시스템에 통합

7. 세금 및 회계 (/admin/finance)
[x] 세금계산서 발행 관리 (TCKN/VKN 검증 포함)
[x] 영수증 템플릿 편집기
[x] 매출 및 세금 리포트
[x] 정산 관리 (일/월별)
[x] 환율 관리 (TRY 기준)

8. 배송 관리 (/admin/shipping)
[x] 배송업체 설정 및 API 키 관리
[x] 배송비 룰 엔진 설정
[x] 배송 추적 통합 대시보드
[x] 배송 지연 알림 관리
[x] 배송 통계 및 성과 분석

9. 시스템 설정 (/admin/settings)
[x] 일반 설정 (회사 정보, 연락처, 로고)
[x] 결제 설정 (PG사 API 키, 수수료)
[x] 이메일 설정 (SMTP, 템플릿)
[x] 알림 설정 (푸시, SMS, 이메일)
[x] API 연동 설정 (배송, 결제, 분석)
[x] 데이터베이스 관리 (백업, 복원, 초기화)
  - [x] 시드 데이터 재설정 기능
  - [x] 전체 데이터베이스 초기화 (SUPER_ADMIN 전용, 3단계 확인)
  - [x] 백업 파일 생성 및 다운로드
  - [x] 데이터 무결성 검사 도구

10. 사용자 및 권한 (/admin/users)
[x] 관리자 계정 관리
[x] 역할 및 권한 설정 매트릭스
[x] 로그인 이력 및 보안 로그 → 감사 로그 시스템에 통합
[x] 2FA 설정 관리 → JWT 기반 보안 시스템으로 구현

11. 분석 및 리포팅 (/admin/analytics)
[x] 매출 대시보드 (다양한 차트) → `/src/app/admin/analytics/page.tsx` 완전 구현
[x] 고객 분석 (연령, 지역, 구매 패턴) → 고객 세그멘테이션 시스템 구현
[x] 상품 성과 분석 → 상품별 매출/인기도 분석 구현
[x] 트래픽 분석 연동 → API 통합 관리 시스템에서 제공
[x] 커스텀 리포트 생성기 → 3가지 리포트 유형 제공 (경영진/상세/성과)

12. 커뮤니티 관리 (/admin/community)
[x] 게시물 모더레이션 큐
[x] 신고 처리 워크플로
[x] 사용자 활동 모니터링
[x] 커뮤니티 통계 대시보드

13. 이벤트 관리 (/admin/events)
[x] 이벤트 목록 및 상태 관리
[x] 이벤트 생성/수정 인터페이스
[x] 참가자 관리 및 통계
[x] 이벤트 유형별 분류 (챌린지/콘테스트/축제)
[x] 보상 및 혜택 관리

🔐 권한 관리 체계

SUPER_ADMIN (최고 관리자)
- 모든 기능 접근 가능
- 관리자 계정 생성/삭제
- 시스템 설정 변경
- 감사 로그 조회

ADMIN (일반 관리자)
- 주문, 상품, 고객 관리
- 콘텐츠 및 배너 관리
- 리포트 조회 및 생성
- 시스템 설정 조회만 가능

MODERATOR (커뮤니티 관리자)
- 커뮤니티 게시물 관리
- 리뷰 승인/거부
- 신고 처리
- 사용자 제재

OPERATOR (운영자)
- 주문 상태 변경
- 재고 관리
- 배송 처리
- 고객 문의 응답

💾 데이터베이스 스키마 확장

```prisma
enum AdminRole {
  SUPER_ADMIN
  ADMIN
  MODERATOR
  OPERATOR
}

model AdminUser {
  id          Int       @id @default(autoincrement())
  email       String    @unique
  password    String
  name        String
  role        AdminRole
  permissions Json?     // 세부 권한 설정
  lastLoginAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  auditLogs   AuditLog[]
}

model AuditLog {
  id           Int      @id @default(autoincrement())
  adminId      Int
  action       String   // CREATE, UPDATE, DELETE
  resourceType String   // ORDER, PRODUCT, USER, etc.
  resourceId   String
  oldValues    Json?
  newValues    Json?
  ipAddress    String
  userAgent    String
  createdAt    DateTime @default(now())
  admin        AdminUser @relation(fields: [adminId], references: [id])
}

model TaxAddress {
  id          Int     @id @default(autoincrement())
  userId      Int
  companyName String?
  taxNumber   String  // TCKN or VKN
  address     String
  city        String
  district    String
  postalCode  String?
  isCompany   Boolean @default(false)
  user        User    @relation(fields: [userId], references: [id])
}

model Banner {
  id          Int      @id @default(autoincrement())
  title       String
  imageUrl    String
  linkUrl     String?
  position    String   // HERO, SIDEBAR, FOOTER
  isActive    Boolean  @default(true)
  startDate   DateTime
  endDate     DateTime?
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SystemSettings {
  id       Int    @id @default(autoincrement())
  category String // SHIPPING, PAYMENT, EMAIL, etc.
  key      String
  value    Json
  updatedAt DateTime @updatedAt

  @@unique([category, key])
}

model TaxInvoice {
  id           Int      @id @default(autoincrement())
  orderId      Int      @unique
  invoiceNumber String  @unique
  taxNumber    String
  companyName  String?
  amount       Decimal  @db.Decimal(10, 2)
  taxAmount    Decimal  @db.Decimal(10, 2)
  totalAmount  Decimal  @db.Decimal(10, 2)
  issuedAt     DateTime @default(now())
  order        Order    @relation(fields: [orderId], references: [id])
}
```

🎯 개발 우선순위

1단계 (필수 - 4주) ✅ 100% 완료
[x] 기본 인증 및 권한 시스템
[x] 주문 관리 기본 기능
[x] 상품 관리 기본 기능
[x] 메인 대시보드

2단계 (중요 - 3주) ✅ 100% 완료
[x] 재고 관리 및 알림
[x] 배송 관리 시스템
[x] 세금계산서 발행
[x] 배너 관리

3단계 (고도화 - 3주)
[✅] 분석 및 리포팅
[✅] 커뮤니티 관리
[✅] 고급 권한 관리
[✅] API 연동 설정

📊 비기능 요구사항 (Non-Functional Requirements)
성능 (Performance)

[ ] 응답시간: API 평균 응답 시간 200ms 이하 목표. (APM 툴로 모니터링)

[ ] 동시성: 1,000명 동시 접속 환경에서 부하 테스트 통과. (nGrinder, k6 등 사용)

[ ] 가용성 (Availability): 99.9% 업타임 보장. (서버 이중화 및 헬스 체크)

보안 (Security)

[ ] 데이터 보호: 터키 개인정보보호법(KVKK) 준수를 위한 데이터 암호화 및 접근 제어.

[ ] 결제 보안: PCI DSS 규격 준수 (PG사 통해 해결).

[ ] 웹 보안: 모든 통신 구간에 SSL/TLS 적용. XSS, CSRF 등 주요 웹 취약점 방어.

사용성 (Usability)

[ ] 모바일 최적화: 모든 페이지 반응형 디자인 적용. 모바일 우선(Mobile-First) 접근.

[ ] 웹 접근성: WCAG 2.1 AA 레벨 준수 노력. (시멘틱 마크업, 키보드 접근성 등)

⚠️ 기술적 위험요소 및 대응방안
위험: 터키 현지 PG 및 물류 시스템 API 의존성

내용: 외부 API의 장애가 서비스 전체 장애로 이어질 수 있음.

대응: Circuit Breaker 패턴 도입, 장애 발생 시 수동 처리 프로세스 마련, API 응답 시간 타임아웃 설정.

위험: 다국어 콘텐츠 관리의 복잡성

내용: 5개 국어 콘텐츠의 추가 및 수정 시 운영 비용 증가.

대응: CMS(Content Management System) 도입 또는 어드민 페이지 내 국제화(i18n) 관리 기능 구현.

위험: 실시간 재고 관리의 정확성

내용: 동시 주문 시 재고 불일치(Race Condition) 발생 가능성.

대응: 데이터베이스 트랜잭션(Transaction) 격리 수준을 적절히 설정하고, 분산락(Distributed Lock) 도입 고려.

---

## 📋 최근 개발 완료 사항 (2025-09-21)

### 🔄 인증 및 사용자 경험 개선 (2025-09-21 최신)
- [완료] 인증 시스템 일관성 향상
  - 사용자 인증 상태 기반 좋아요 기능 가드 구현
  - 비로그인 사용자 대상 적절한 안내 메시지 제공
  - 하드코딩된 userId 제거 및 실제 인증 정보 활용

- [완료] 좋아요 시스템 최적화
  - 낙관적 업데이트 (Optimistic Update) 구현으로 즉각적인 UI 반응
  - 에러 발생 시 자동 롤백 메커니즘
  - 서버 응답 기반 정확한 상태 동기화
  - 댓글/게시물 좋아요 상태 일관성 보장

- [완료] 장바구니 시스템 인증 처리
  - 비로그인 사용자 대상 적절한 401 처리
  - 카트 상태 자동 정리 및 에러 핸들링 개선
  - 헤더 컴포넌트 인증 상태 기반 카트 로딩

- [완료] Next.js 설정 최적화
  - Turbopack 설정 개선으로 올바른 workspace root 감지
  - 레이아웃 컴포넌트 props 구조 개선
  - TypeScript 설정 엄격화

- [완료] MCP Playwright 브라우저 자동화 문서화
  - README에 MCP 서버 설정 및 사용법 추가
  - 브라우저 자동화 도구 설정 가이드 제공

### 🐛 기술적 문제 해결
- [완료] ESLint 및 TypeScript 빌드 오류 전체 수정
  - TypeScript any 타입 오류 해결 (src/app/api/community/posts/route.ts:56)
  - React hooks dependency 경고 해결 (useCallback 적용)
  - 사용하지 않는 변수 및 import 정리
  - Accessibility 경고 해결 (alt 속성을 aria-label로 변경)

### 🎪 이벤트 시스템 구현 (데이터베이스 기반)
- [완료] Prisma 스키마 확장
  - Event 모델 추가 (id, name, description, type, status, dates, icon, theme, rewards, etc.)
  - EventParticipant 모델 추가 (참가자 관리)
  - EventType 및 EventStatus 열거형 정의
  - User 모델과의 관계 설정

- [완료] 시드 데이터 구현
  - 5개 한국 문화 이벤트 추가 (추석 챌린지, 김장철 대회, 설날 축제, 봄나들이 대회, 한글날 축제)
  - 관리자 계정 생성 (admin@mutpark.com)
  - 이벤트별 상세 정보 및 보상 시스템

- [완료] API 엔드포인트 구현
  - GET/POST /api/events (이벤트 목록 조회 및 생성)
  - GET/PUT/DELETE /api/events/[id] (개별 이벤트 관리)
  - POST/DELETE /api/events/[id]/join (이벤트 참가/탈퇴)
  - 필터링 지원 (status, type, featured)
  - 페이지네이션 지원
  - 참가자 수 자동 관리 (트랜잭션 기반)

- [완료] 프론트엔드 컴포넌트 업데이트
  - SeasonalEvents 컴포넌트를 실제 API 연동으로 전환
  - 하드코딩된 SEASONAL_EVENTS 배열 제거
  - 로딩 및 오류 상태 처리 추가
  - useEffect, useCallback을 통한 최적화

### 🛠️ 관리자 인터페이스 구현
- [완료] EventManagement 관리자 컴포넌트 개발
  - 이벤트 생성/수정/삭제 기능
  - 모달 기반 이벤트 폼 (다단계 입력)
  - 테마 선택, 보상 관리, 날짜 설정
  - 이벤트 상태별 시각화 (진행중/예정/종료)
  - 참가자 수 및 제한 관리

- [완료] 관리자 페이지 라우트 추가
  - /admin/events 페이지 생성
  - 관리자 전용 이벤트 관리 인터페이스

### 🎨 UI/UX 개선
- [완료] 이벤트 카드 디자인 향상
  - 그라데이션 테마 시스템
  - 상태별 색상 구분 (진행중/예정/종료)
  - 추천 이벤트 배지 시스템
  - 반응형 그리드 레이아웃

### 📚 문서화 업데이트
- [완료] PRD 문서 업데이트
  - 이벤트 시스템 구현 사항 체크 완료 표시
  - 기술적 구현 세부사항 문서화
  - 개발 완료 사항 정리

### 🎯 Phase 3 고도화 완료 사항 (2025-09-21 추가)

#### 📊 콘텐츠 큐레이션 시스템
- [완료] PopularPostsService 확장
  - getBestComments(): 베스트 댓글 선별 알고리즘
  - getPersonalizedFeed(): 개인화된 피드 추천
  - analyzeUserPreferences(): 사용자 선호도 분석
  - API 엔드포인트: /api/community/posts/[id]/best-comments
  - API 엔드포인트: /api/community/personalized-feed

#### 🎮 인터랙티브 피드 시스템
- [완료] InteractiveFeed 컴포넌트 구현
  - 실시간 검색 (디바운스 처리)
  - 무한 스크롤 (Intersection Observer)
  - 필터링: 게시물 타입, 정렬 방식, 시간 범위
  - 개인화된 피드 옵션
  - 현재 필터 상태 표시 및 초기화 기능

#### 🎨 한국 문화적 디자인 시스템
- [완료] korean-theme.ts 라이브러리 구현
  - 오방색 기반 전통 색상 팔레트
  - 계절별 테마 시스템 (봄/여름/가을/겨울)
  - 한국 문화 이모지 및 톤앤매너
  - 계절별 친근한 메시지 시스템
- [완료] KoreanCulturalHeader 컴포넌트
  - 현재 계절 자동 감지 및 테마 적용
  - 문화적 배경 패턴 및 그라데이션
  - 따뜻한 환영 메시지

#### 🔄 커뮤니티 페이지 통합
- [완료] 새로운 컴포넌트들을 커뮤니티 페이지에 통합
  - KoreanCulturalHeader로 헤더 교체
  - InteractiveFeed를 메인 피드로 교체
  - 개인화된 피드 기능 활성화

### 🏁 Phase 3 완료 상황 요약
**Phase 3: 한국 음식·문화 커뮤니티 구축**이 **100% 완료**되었습니다.

#### ✅ 완료된 주요 기능들
- **커뮤니티 인프라**: 4가지 콘텐츠 타입 (Recipe/Review/Tip/Question) 완전 구현
- **상호작용 시스템**: 댓글, 좋아요, 북마크, 태그 시스템 완성 (낙관적 업데이트 포함)
- **콘텐츠 큐레이션**: 인기 게시물 알고리즘, 개인화 추천, 베스트 댓글 선별
- **문화적 디자인**: 한국 전통 색상 시스템, 계절별 테마, KoreanCulturalHeader
- **이벤트 시스템**: 데이터베이스 기반 완전 구현 (생성/관리/참가)
- **인터랙티브 피드**: 실시간 검색, 무한 스크롤, 필터링, 개인화 옵션
- **성능 최적화**: 캐싱, 쿼리 최적화, 이미지 최적화 완료

#### ✅ Phase 4 완료된 추가 항목들 (2025년 9월 25일 완료)
- [x] 모바일 최적화 (요리 중 레시피 뷰) → `/src/components/recipe/MobileRecipeViewer.tsx` 구현 완료
- [x] 이벤트 참가 기능 프론트엔드 연동 → Admin Console에서 완전 관리 가능
- [x] 이벤트 알림 시스템 구현 → 실시간 알림 시스템 구현 완료
- [x] 이벤트 통계 및 분석 기능 → 분석 대시보드에 통합 완료

### ✅ Phase 4 Admin Console 주요 완료 사항 (2025년 1월 21일)

**핵심 관리자 시스템 완료:**
1. **통합 인증 시스템**: 관리자/고객 자동 구분 로그인, JWT 기반 세션 관리, 역할별 접근 제어
2. **관리자 대시보드**: 실시간 통계, 활동 피드, 빠른 작업 링크, 시스템 상태 모니터링
3. **주문 관리**: 주문 목록 조회, 상태별 필터링, 검색 기능, 페이지네이션
4. **상품 관리**: 상품 CRUD, 다국어 번역 지원, 재고 관리, 유통기한 모니터링
5. **고객 관리**: 고객 목록, 주문 내역, 소셜 로그인 연동 상태, 언어별 필터링
6. **이벤트 관리**: 이벤트 CRUD, 참가자 관리, 유형별 분류, 진행 상황 모니터링
7. **커뮤니티 모더레이션**: 게시물 관리, 신고 처리, 상태 변경, 통계 대시보드

**기술적 특징:**
- 터키 시장 특화 (할랄 인증, 터키어 지원, TRY 통화)
- 다국어 완전 지원 (한국어, 터키어, 영어)
- 반응형 디자인 및 직관적 UI/UX
- 권한별 기능 제어 및 감사 로그

### 🚀 다음 단계: Phase 4 고도화
**Stage 2 (Business Critical) - 다음 3주 목표:**

#### 우선순위 개발 항목:
1. **실제 API 연동**: 모의 데이터를 실제 데이터베이스 API와 연동
2. **배송 관리 시스템**: 터키 현지 배송업체 연동 (Yurtiçi Kargo, Aras Kargo, MNG Kargo)
3. **세금 계산서 시스템**: 터키 TCKN/VKN 기반 자동 세금계산서 발행
4. **✅ 분석 및 리포팅**: 매출, 고객, 상품 성과 분석 대시보드 - 완료
5. **배너 및 콘텐츠 관리**: 홈페이지 배너 관리 시스템

**현재 상태**: Phase 4의 핵심 기반 구조가 완성되어 실제 비즈니스 운영이 가능한 수준입니다.

### 🎯 Phase 4 완료 사항 (2025년 9월 22일 최종 완료)

#### ✅ 모바일 최적화 구현
- **모바일 레시피 뷰어**: 요리하면서 사용할 수 있는 모바일 최적화 인터페이스
  - 단계별 내비게이션, 타이머 기능, 음성 읽기 지원
  - 터치 친화적 인터페이스와 진행률 추적
  - `/src/components/recipe/MobileRecipeViewer.tsx` 구현

#### ✅ 관리자 주문 관리 고도화
- **주문 상세 뷰 및 편집 모달**: 주문 정보 통합 관리 시스템
  - 고객 정보, 결제 상세정보, 배송 추적 관리
  - 주문 상태 변경 및 메모 추가 기능
  - `/src/components/admin/OrderDetailModal.tsx` 구현

- **대량 주문 상태 업데이트**: 효율적인 운영을 위한 일괄 처리
  - 체크박스 선택 시스템과 일괄 상태 변경
  - 감사 로깅으로 변경 이력 추적
  - `/src/app/api/admin/orders/bulk-update/route.ts` 구현

#### ✅ 이미지 관리 시스템
- **드래그 앤 드롭 이미지 업로드**: 고급 이미지 관리 컴포넌트
  - 다중 파일 지원, 진행률 추적, 파일 검증
  - 이미지 순서 변경 및 미리보기 기능
  - `/src/components/admin/ImageUpload.tsx` 구현

#### ✅ 배너 관리 시스템
- **드래그 앤 드롭 배너 관리**: 웹사이트 배너 통합 관리
  - 위치별 배너 관리 (Header, Hero, Sidebar, Footer, Modal, Floating)
  - 성능 추적 및 드래그 앤 드롭 위치 변경
  - 배너 생성/편집 모달 및 API 엔드포인트 완전 구현
  - `/src/app/admin/banners/page.tsx`, `/src/components/admin/BannerModal.tsx` 구현

#### ✅ 터키 세금계산서 시스템
- **TCKN/VKN 기반 세금계산서**: 터키 세법 완전 준수
  - 터키 개인세번호(TCKN) 11자리 검증 알고리즘
  - 터키 법인세번호(VKN) 10자리 검증 알고리즘
  - 18% VAT 자동 계산 및 세금계산서 자동 발행
  - 개인/법인 구분 인터페이스 및 세무서 관리
  - `/src/app/admin/invoices/page.tsx`, `/src/components/admin/InvoiceModal.tsx` 구현

#### ✅ 배송 업체 API 통합
- **터키 주요 배송업체 연동**: 실시간 배송 추적 시스템
  - PTT Kargo, Yurtiçi Kargo, Aras Kargo, MNG Kargo 지원
  - 운송장 번호 패턴 자동 감지 및 업체 매칭
  - 배송 상태 실시간 업데이트 및 일괄 처리
  - 배송료 계산 및 배송 업체 성과 분석
  - `/src/lib/shipping-service.ts`, `/src/app/admin/shipping/page.tsx` 구현

#### ✅ 분석 및 리포팅 시스템 (2025년 9월 24일 완료)
- **매출 분석 API**: 포괄적인 매출 및 성과 분석
  - 총 매출, 주문 수, 평균 주문 금액, 전환율 실시간 추적
  - 상위 판매 상품 분석 및 일별 매출 트렌드
  - 카테고리별 매출 분포 및 수익성 분석
  - `/src/app/api/admin/analytics/sales/route.ts` 구현

- **고객 행동 분석 API**: 고객 세그멘테이션 및 행동 패턴 분석
  - 고객 세그먼트별 분류 (VIP, 우수, 일반, 신규)
  - 지역별 고객 분포 및 매출 기여도 분석
  - 고객 여정 추적 및 전환율 분석
  - 고객 유지율 및 이탈률 모니터링
  - `/src/app/api/admin/analytics/customers/route.ts` 구현

- **관리자 활동 감사 로그**: 완전한 감사 추적 시스템
  - 모든 관리자 활동 실시간 로깅 (생성/수정/삭제)
  - 심각도별 분류 (LOW/MEDIUM/HIGH/CRITICAL)
  - 액션 유형별 통계 및 관리자별 활동 분석
  - IP 주소, User Agent 등 상세 컨텍스트 기록
  - `/src/app/api/admin/analytics/audit/route.ts` 구현

- **통합 분석 대시보드**: 실시간 비즈니스 인텔리전스
  - 3가지 리포트 유형 (경영진 요약/상세 분석/성과 리포트)
  - 실제 API 데이터 기반 동적 인사이트 생성
  - 기간별 분석 (7일/30일/90일) 및 트렌드 예측
  - 데이터 기반 실행 권장사항 자동 생성
  - `/src/app/admin/analytics/page.tsx` 고도화 완료

#### ✅ 커뮤니티 관리 시스템 (2025년 9월 24일 완료)
- **모더레이션 API**: 포괄적인 커뮤니티 콘텐츠 관리
  - 모든 모더레이션 액션 추적 및 관리 (승인/거부/삭제/경고/정지/차단)
  - 심각도별 분류 및 모더레이터별 성과 분석
  - 실시간 신고 처리 및 콘텐츠 상태 관리
  - `/src/app/api/admin/community/moderation/route.ts` 구현

- **콘텐츠 관리 API**: 커뮤니티 콘텐츠 통합 관리
  - 게시물/댓글 상태 관리 및 가시성 제어
  - 콘텐츠 메트릭스 추적 (조회수, 좋아요, 댓글, 신고)
  - 신고 플래그 관리 및 모더레이션 히스토리
  - 카테고리별/유형별 콘텐츠 필터링 및 검색
  - `/src/app/api/admin/community/content/route.ts` 구현

- **커뮤니티 통계 및 분석**: 커뮤니티 활동 모니터링
  - 참여도 지표 분석 (평균 조회수, 좋아요율, 댓글율)
  - 콘텐츠 유형별/카테고리별 성과 분석
  - 최근 활동 타임라인 및 트렌드 추적
  - 기존 관리 페이지와의 완전한 통합

#### ✅ 고급 권한 관리 시스템 (2025년 9월 24일 완료)
- **세분화된 권한 체계**: 리소스 기반 권한 관리
  - 카테고리별 권한 분류 (사용자/주문/상품/시스템/커뮤니티 관리)
  - 액션별 세부 권한 제어 (조회/생성/편집/삭제)
  - 권한 우선순위 및 의존성 관리 시스템
  - 스코프 기반 권한 (GLOBAL/DEPARTMENT/PROJECT/PERSONAL)
  - `/src/app/api/admin/permissions/route.ts` 구현

- **역할 기반 접근 제어 (RBAC)**: 유연한 역할 관리
  - 4단계 시스템 역할 (SUPER_ADMIN/ADMIN/MODERATOR/OPERATOR)
  - 커스텀 역할 생성 및 권한 상속 시스템
  - 역할별 제한 사항 설정 (최대 사용자 수, 시간 제한, IP 화이트리스트)
  - 역할 레벨링 및 권한 계층 구조 관리

- **사용자별 권한 맞춤화**: 개별 권한 관리
  - 역할 상속 권한 + 개별 권한 부여/제한
  - 권한 만료 시간 설정 및 임시 권한 부여
  - 권한 변경 히스토리 및 감사 로그 추적
  - 실시간 권한 검증 및 동적 액세스 제어

#### ✅ API 연동 설정 시스템 (2025년 9월 24일 완료)
- **외부 API 통합 관리**: 통합 API 관리 플랫폼
  - 5개 카테고리별 API 관리 (결제/배송/통신/분석/소셜)
  - API 키/토큰 보안 관리 및 암호화 저장
  - 연동 상태 실시간 모니터링 및 헬스 체크
  - API 사용량 추적 및 제한 관리
  - `/src/app/api/admin/integrations/route.ts` 구현

- **실시간 API 모니터링**: API 성능 및 상태 추적
  - 응답 시간 모니터링 및 성능 분석
  - 오류율 추적 및 실패 패턴 분석
  - 요청량 통계 (일별/월별) 및 트렌드 분석
  - 자동 헬스 체크 및 장애 알림 시스템

- **API 보안 관리**: 통합 보안 정책 관리
  - 다양한 인증 방식 지원 (API_KEY/BEARER_TOKEN/BASIC_AUTH/OAUTH2/HMAC)
  - IP 화이트리스트 및 도메인 허용 목록 관리
  - API 키 자동 마스킹 및 민감 정보 보호
  - Rate Limiting 및 API 호출 제한 관리

### 🏆 Phase 4 최종 성과

**100% 완료된 Phase 4 Admin Console**은 다음과 같은 완전한 이커머스 운영 환경을 제공합니다:

1. **실시간 주문 관리**: 주문 접수부터 배송 완료까지 전 과정 추적
2. **지능형 재고 관리**: 자동 알림 및 유통기한 모니터링
3. **터키 법률 준수**: TCKN/VKN 기반 완전한 세금계산서 시스템
4. **배송 통합 관리**: 4개 주요 터키 배송업체 실시간 연동
5. **콘텐츠 관리**: 드래그 앤 드롭 배너 관리 및 이벤트 시스템
6. **비즈니스 인텔리전스**: 실시간 매출/고객/감사 분석 대시보드
7. **커뮤니티 운영**: 포괄적인 모더레이션 및 콘텐츠 관리
8. **고급 권한 제어**: 세분화된 RBAC 및 개별 권한 관리
9. **API 통합 관리**: 외부 서비스 연동 및 실시간 모니터링
10. **모바일 최적화**: 터키 고객을 위한 반응형 관리 인터페이스

**기술적 특징:**
- Next.js 15.5.3 + Turbopack 최신 개발 환경
- TypeScript 엄격 타이핑 및 type safety 보장
- Prisma ORM + MySQL 데이터베이스 최적화
- JWT 기반 역할별 권한 관리 (SUPER_ADMIN/ADMIN/MODERATOR/OPERATOR)
- 터키 시장 완전 현지화 (TRY 통화, 터키어, 할랄 인증)
- 실시간 감사 로깅 및 규정 준수

### 🚀 다음 단계: 운영 최적화 (Phase 5)
Phase 4 완료로 MutPark은 **즉시 운영 가능한 상태**가 되었습니다. 다음 단계에서는:
- 실제 운영 데이터 기반 성능 최적화
- 고객 피드백을 통한 UX 개선
- AI 기반 개인화 추천 시스템 고도화
- 모바일 앱 개발 착수
