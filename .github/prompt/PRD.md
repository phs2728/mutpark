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

[ ] 인프라 구축

[x] 데이터베이스 스키마 설계 (User, Product, Order 등)

[x] Docker를 이용한 개발 환경 컨테이너화

[ ] AWS/GCP 등 클라우드 서버 기본 환경 설정

[ ] CI/CD 파이프라인 구축 (GitHub Actions)

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

[ ] 확장된 커뮤니티 콘텐츠 시스템

[ ] 4가지 콘텐츠 타입별 최적화된 API
  - RECIPE: 사용자 레시피 공유 (재료, 조리법, 스토리텔링)
  - REVIEW: 상품/장소/이벤트/미디어 리뷰 시스템
  - TIP: 문화 꿀팁 및 생활 지혜 공유
  - QUESTION: Q&A 시스템 및 문화 질문

[ ] 고급 상호작용 시스템
  - 댓글 및 대댓글 시스템 (2단계)
  - 좋아요 및 북마크 기능
  - 멘션 시스템 (@사용자명)
  - 태그 시스템 (#지역태그 #재료태그 #문화태그)

[ ] 커뮤니티 활성화 기능
  - 배지 시스템 (요리마스터, 문화가이드, 친화대사, 현지전문가)
  - 계절별 이벤트 (추석/설날 챌린지, 김장철 대회)
  - 지역별 소모임 지원 (오프라인 연결)

[ ] 콘텐츠 큐레이션
  - 인기 게시물 알고리즘
  - 사용자 맞춤 추천
  - 베스트 댓글 선별

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

[ ] 고도화된 커뮤니티 인터페이스

[ ] 타입별 최적화된 작성 폼
  - 레시피 공유: 다단계 위저드 (기본정보 → 재료 → 조리과정 → 팁)
  - 상품 리뷰: 평점 + 구조화된 리뷰
  - 꿀팁/질문: 간단한 에디터 + 태그
  - 스토리텔링 중심 UI (왜 이 요리를 하게 되었는지)

[ ] 인터랙티브 피드 시스템
  - 필터 및 정렬 (인기순, 최신순, 타입별)
  - 무한 스크롤 및 검색
  - 실시간 좋아요/댓글 업데이트
  - 멘션 자동완성 (@사용자명)

[ ] 문화적 감성 디자인
  - 한국 전통 색상 팔레트 적용
  - 친근한 톤앤매너 (반말 문화 반영)
  - 따뜻한 일러스트레이션
  - 계절감 있는 테마 변경

[ ] 모바일 최적화
  - 요리하면서 쉽게 볼 수 있는 레시피 뷰
  - 터치 친화적 인터랙션
  - 오프라인 북마크 기능

[x] 개인화 UI

[x] 메인 페이지 및 상품 페이지에 개인화 추천 상품 영역 추가

[ ] 모바일 앱 개발 (별도 프로젝트)

[ ] React Native/Flutter 기반 앱 개발 착수

[x] 웹 성능 최적화

[x] 코드 스플리팅, 이미지 레이지 로딩 적용

[x] Lighthouse 점수 90점 이상 목표

[x] 디자인 가이드 적용

[x] Phase 2에서 정의한 디자인 토큰 및 컴포넌트를 UI 전반에 반영

[x] 리뷰 컴포넌트 리디자인 적용

[x] 레시피/커뮤니티 피드 UI 리뉴얼

Phase 4: Admin Console 구축
핵심 목표: 터키 이커머스 운영에 특화된 관리 도구를 제공하여 주문, 재고, 콘텐츠, 세금계산, 배송업체 연동을 효율적으로 관리한다.

🏗️ 데이터베이스 확장
[ ] 관리자 권한 및 감사 로그 모델 추가
```sql
- AdminRole (SUPER_ADMIN, ADMIN, MODERATOR, OPERATOR)
- AuditLog (관리자 활동 기록)
- SystemSettings (배송업체, 세금, 배너 등 설정)
- TaxInvoice (세금계산서 발행 관리)
- Banner (홈페이지 배너 관리)
- ShippingProvider (배송업체 설정 및 API 연동)
```

[ ] 터키 세금계산서 및 주소 관리 모델
```sql
- TaxAddress (세금계산용 주소 - TCKN/VKN 포함)
- InvoiceTemplate (영수증 템플릿 관리)
- CompanyInfo (회사 정보 및 세금 정보)
```

🔧 BE: 어드민 지원 기능

주문 관리 시스템
[ ] 주문 현황 대시보드 API (실시간 통계, 일/월/년 매출)
[ ] 주문 상세 조회 및 상태 변경 API
[ ] 배송 추적 정보 업데이트 API (배송업체별 연동)
[ ] 주문 취소/환불 처리 워크플로 API
[ ] 대량 주문 처리 (CSV 업로드/다운로드)

상품 및 재고 관리
[ ] 상품 상세페이지 생성/수정 API (다국어 지원)
[ ] 재고 모니터링 및 자동 알림 API
[ ] 유통기한 관리 및 임박 상품 알림
[ ] 상품 이미지 업로드 및 관리 API
[ ] 가격 변경 이력 관리 및 일괄 가격 수정

콘텐츠 관리 시스템 (CMS)
[ ] 홈페이지 배너 관리 API (위치별, 기간별 설정)
[ ] 이벤트/프로모션 관리 API
[ ] SEO 메타데이터 관리 API
[ ] 다국어 콘텐츠 관리 API (터키어, 한국어, 영어, 아랍어, 러시아어)

터키 특화 기능
[ ] 세금계산서 자동 발행 API (TCKN/VKN 기반)
[ ] 터키 개인정보보호법(KVKK) 준수 데이터 관리
[ ] 할랄 인증 상품 관리 및 필터링
[ ] 터키 결제 시스템 (Iyzico, PayU) 설정 관리

배송 관리 시스템
[ ] 배송업체 API 연동 설정 (Yurtiçi Kargo, Aras Kargo, MNG Kargo)
데이터베이스 관리 시스템
[ ] 데이터베이스 백업 및 복원 API
[ ] 시드 데이터 관리 (초기화/재설정) API
[ ] 데이터베이스 완전 초기화 기능 (경고 및 확인 절차 포함)
[ ] 데이터 마이그레이션 및 스키마 변경 관리
[ ] 데이터베이스 성능 모니터링 및 최적화 도구
[ ] 배송비 계산 룰 엔진 (지역별, 무게별, 수량별)
[ ] 배송 추적 통합 API
[ ] 배송 지연 자동 알림 시스템

사용자 및 권한 관리
[ ] 관리자 계정 생성/수정/삭제 API
[ ] 역할 기반 권한 관리 (RBAC) API
[ ] 관리자 활동 감사 로그 API
[ ] 2FA (Two-Factor Authentication) 지원

분석 및 리포팅
[ ] 매출 분석 API (일/주/월/년, 상품별, 지역별)
[ ] 고객 행동 분석 API
[ ] 재고 회전율 분석 API
[ ] 커뮤니티 활동 통계 API

🎨 FE: 어드민 콘솔 UI

1. 기본 레이아웃 및 인증
[ ] /admin 라우트 보호 및 인증 시스템
[ ] 반응형 관리자 대시보드 레이아웃
[ ] 다크모드 지원 및 사용자 설정
[ ] 실시간 알림 시스템 (WebSocket 기반)

2. 메인 대시보드 (/admin/dashboard)
[ ] 실시간 주문 현황 위젯
[ ] 매출 트렌드 차트 (Chart.js/Recharts)
[ ] 재고 부족 알림 카드
[ ] 신규 리뷰/게시물 알림
[ ] 시스템 상태 모니터링

3. 주문 관리 (/admin/orders)
[ ] 주문 목록 테이블 (필터링, 정렬, 페이지네이션)
[ ] 주문 상세 뷰 및 편집 모달
[ ] 배송 상태 일괄 업데이트
[ ] 주문서/송장 프린트 기능
[ ] 환불/취소 처리 워크플로

4. 상품 관리 (/admin/products)
[ ] 상품 목록 그리드/테이블 뷰
[ ] 상품 생성/수정 폼 (위지윅 에디터 포함)
[ ] 이미지 드래그앤드롭 업로드
[ ] 재고 관리 및 알림 설정
[ ] 가격 변경 이력 뷰어
[ ] 상품 일괄 수정 (CSV 업로드)

5. 콘텐츠 관리 (/admin/content)
[ ] 배너 관리 인터페이스 (위치별 드래그앤드롭)
[ ] 이벤트/프로모션 캘린더
[ ] 다국어 콘텐츠 편집기
[ ] SEO 설정 패널
[ ] 페이지 미리보기 기능

6. 고객 관리 (/admin/customers)
[ ] 고객 목록 및 상세 정보
[ ] 주소 관리 (배송용/세금계산용 구분)
[ ] 주문 이력 및 통계
[ ] KVKK 개인정보 처리 기록
[ ] 고객 문의 및 지원 기록

7. 세금 및 회계 (/admin/finance)
[ ] 세금계산서 발행 관리
[ ] 영수증 템플릿 편집기
[ ] 매출 및 세금 리포트
[ ] 정산 관리 (일/월별)
[ ] 환율 관리 (TRY 기준)

8. 배송 관리 (/admin/shipping)
[ ] 배송업체 설정 및 API 키 관리
[ ] 배송비 룰 엔진 설정
[ ] 배송 추적 통합 대시보드
[ ] 배송 지연 알림 관리
[ ] 배송 통계 및 성과 분석

9. 시스템 설정 (/admin/settings)
[ ] 일반 설정 (회사 정보, 연락처, 로고)
[ ] 결제 설정 (PG사 API 키, 수수료)
[ ] 이메일 설정 (SMTP, 템플릿)
[ ] 알림 설정 (푸시, SMS, 이메일)
[ ] API 연동 설정 (배송, 결제, 분석)
[ ] 데이터베이스 관리 (백업, 복원, 초기화)
  - 시드 데이터 재설정 기능
  - 전체 데이터베이스 초기화 (SUPER_ADMIN 전용, 3단계 확인)
  - 백업 파일 생성 및 다운로드
  - 데이터 무결성 검사 도구

10. 사용자 및 권한 (/admin/users)
[ ] 관리자 계정 관리
[ ] 역할 및 권한 설정 매트릭스
[ ] 로그인 이력 및 보안 로그
[ ] 2FA 설정 관리

11. 분석 및 리포팅 (/admin/analytics)
[ ] 매출 대시보드 (다양한 차트)
[ ] 고객 분석 (연령, 지역, 구매 패턴)
[ ] 상품 성과 분석
[ ] 트래픽 분석 연동 (Google Analytics)
[ ] 커스텀 리포트 생성기

12. 커뮤니티 관리 (/admin/community)
[ ] 게시물 모더레이션 큐
[ ] 신고 처리 워크플로
[ ] 사용자 활동 모니터링
[ ] 커뮤니티 통계 대시보드

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

1단계 (필수 - 4주)
[ ] 기본 인증 및 권한 시스템
[ ] 주문 관리 기본 기능
[ ] 상품 관리 기본 기능
[ ] 메인 대시보드

2단계 (중요 - 3주)
[ ] 재고 관리 및 알림
[ ] 배송 관리 시스템
[ ] 세금계산서 발행
[ ] 배너 관리

3단계 (고도화 - 3주)
[ ] 분석 및 리포팅
[ ] 커뮤니티 관리
[ ] 고급 권한 관리
[ ] API 연동 설정

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
