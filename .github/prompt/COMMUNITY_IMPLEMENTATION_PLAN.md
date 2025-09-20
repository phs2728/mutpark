# 한국 음식·문화 커뮤니티 세부 구현 계획

## 🎯 전체 개발 로드맵 (8주)

### 1단계: 기반 구조 재설계 (2주)
**목표**: 현재 커뮤니티를 문화적 맥락을 가진 고도화된 커뮤니티로 전환

#### Week 1: 데이터베이스 및 API 재설계
- [ ] Prisma 스키마 확장
- [ ] CommunityPost에 RECIPE 타입 복원 및 필드 추가
- [ ] 댓글 시스템 구현 (2단계 깊이)
- [ ] 좋아요/북마크 시스템
- [ ] 태그 및 멘션 시스템

#### Week 2: 기본 API 구현
- [ ] 타입별 최적화된 CRUD API
- [ ] 댓글 시스템 API
- [ ] 검색 및 필터링 API
- [ ] 파일 업로드 최적화

### 2단계: 핵심 UI 컴포넌트 (2주)
**목표**: 4가지 콘텐츠 타입에 최적화된 사용자 인터페이스 구현

#### Week 3: 작성 폼 시스템
- [ ] 콘텐츠 타입 선택 모달
- [ ] 레시피 공유 위저드 폼
- [ ] 리뷰 작성 폼 (평점 + 구조화)
- [ ] 꿀팁/질문 간단 폼

#### Week 4: 피드 및 상세 화면
- [ ] 통합 커뮤니티 피드
- [ ] 타입별 필터링 UI
- [ ] 게시물 상세 화면
- [ ] 댓글 시스템 UI

### 3단계: 고급 기능 및 상호작용 (2주)
**목표**: 커뮤니티 활성화를 위한 고급 소셜 기능

#### Week 5: 상호작용 기능
- [ ] 실시간 좋아요/댓글
- [ ] 멘션 자동완성
- [ ] 태그 시스템
- [ ] 북마크 및 개인 컬렉션

#### Week 6: 검색 및 큐레이션
- [ ] 고급 검색 기능
- [ ] 인기 게시물 알고리즘
- [ ] 추천 시스템 연동
- [ ] 트렌딩 태그

### 4단계: 문화적 감성 및 최적화 (2주)
**목표**: 한국 문화의 정서를 반영한 디자인과 사용자 경험

#### Week 7: 문화적 디자인
- [ ] 한국 전통 색상 팔레트
- [ ] 계절별 테마 시스템
- [ ] 문화적 일러스트레이션
- [ ] 친근한 마이크로카피

#### Week 8: 최종 최적화 및 배포
- [ ] 성능 최적화
- [ ] 모바일 경험 개선
- [ ] 접근성 향상
- [ ] 최종 테스트 및 배포

---

## 📊 데이터베이스 스키마 확장

### CommunityPost 모델 업데이트

```prisma
enum PostType {
  RECIPE    // 사용자 레시피 공유
  REVIEW    // 상품/장소/이벤트/미디어 리뷰
  TIP       // 문화 꿀팁 및 생활 지혜
  QUESTION  // Q&A 및 문화 질문
}

model CommunityPost {
  id            Int        @id @default(autoincrement())
  authorId      Int
  type          PostType
  title         String
  content       String     @db.Text

  // 레시피 전용 필드
  difficulty    Difficulty?  // EASY, MEDIUM, HARD
  cookingTime   Int?        // 분 단위
  servings      Int?        // 인분수
  ingredients   Json?       // 재료 정보
  instructions  Json?       // 조리 과정

  // 리뷰 전용 필드
  rating        Int?        // 1-5점
  reviewType    String?     // PRODUCT, PLACE, EVENT, MEDIA

  // 공통 필드
  imageUrl      String?
  images        Json?       // 다중 이미지
  tags          Json?       // 태그 배열
  mentions      Json?       // 멘션된 사용자들

  // 연결 관계
  productId     Int?        // 상품 연결 (리뷰용)

  // 상호작용
  likesCount    Int         @default(0)
  commentsCount Int         @default(0)
  bookmarksCount Int        @default(0)
  viewsCount    Int         @default(0)

  // 메타데이터
  publishedAt   DateTime?
  status        PostStatus  @default(PUBLISHED)
  featured      Boolean     @default(false)
  metadata      Json?

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // 관계
  author        User                   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  product       Product?               @relation(fields: [productId], references: [id])
  likes         CommunityPostLike[]
  comments      CommunityPostComment[]
  bookmarks     CommunityPostBookmark[]

  @@index([type])
  @@index([createdAt])
  @@index([authorId])
  @@index([likesCount])
  @@index([tags], type: Hash)
}
```

### 새로운 모델들

```prisma
// 북마크 시스템
model CommunityPostBookmark {
  id     Int  @id @default(autoincrement())
  postId Int
  userId Int
  collectionName String? // 사용자 정의 컬렉션
  createdAt DateTime @default(now())

  post CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
}

// 댓글 좋아요
model CommunityCommentLike {
  id        Int      @id @default(autoincrement())
  commentId Int
  userId    Int
  createdAt DateTime @default(now())

  comment CommunityPostComment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user    User                 @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([commentId, userId])
}

// 사용자 팔로우 (커뮤니티 활성화용)
model UserFollow {
  id          Int      @id @default(autoincrement())
  followerId  Int      // 팔로우하는 사람
  followingId Int      // 팔로우받는 사람
  createdAt   DateTime @default(now())

  follower  User @relation("UserFollower", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("UserFollowing", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
}

// 배지 시스템
model UserBadge {
  id          Int       @id @default(autoincrement())
  userId      Int
  badgeType   BadgeType
  earnedAt    DateTime  @default(now())
  metadata    Json?     // 배지 획득 관련 추가 정보

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeType])
}

enum BadgeType {
  COOKING_MASTER    // 요리 마스터
  CULTURE_GUIDE     // 문화 가이드
  FRIENDLY_AMBASSADOR // 친화 대사
  LOCAL_EXPERT      // 현지 전문가
  FIRST_POST        // 첫 게시물
  HELPFUL_REVIEWER  // 도움되는 리뷰어
  COMMUNITY_VETERAN // 커뮤니티 베테랑
}
```

---

## 🔄 실시간 기능 기술 아키텍처

### 실시간 기능 요구사항
- **실시간 좋아요/댓글**: 즉시 UI 업데이트
- **멘션 알림**: @사용자명 시 실시간 알림
- **새 게시물 알림**: 팔로잉 사용자의 새 글 알림
- **댓글 알림**: 내 게시물에 댓글 달림 알림

### 기술 스택 선택

#### 1. Server-Sent Events (SSE) - 선택된 기술
**장점:**
- HTTP 기반으로 방화벽 친화적
- 자동 재연결 지원
- 브라우저 네이티브 지원
- Next.js API Routes와 쉬운 통합

**구현 방식:**
```typescript
// /api/notifications/stream
export async function GET(request: Request) {
  const user = await getAuthenticatedUser();

  const stream = new ReadableStream({
    start(controller) {
      // 사용자별 알림 스트림 생성
      const interval = setInterval(() => {
        const data = `data: ${JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now()
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      }, 30000);

      // 실제 알림 이벤트 처리
      notificationEmitter.on(`user:${user.id}`, (notification) => {
        const data = `data: ${JSON.stringify(notification)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

#### 2. Redis Pub/Sub for 서버간 통신
```typescript
// lib/realtime.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
const pub = new Redis(process.env.REDIS_URL);

export class NotificationEmitter extends EventEmitter {
  constructor() {
    super();
    this.setupRedisSubscription();
  }

  private setupRedisSubscription() {
    redis.subscribe('notifications');
    redis.on('message', (channel, message) => {
      const notification = JSON.parse(message);
      this.emit(`user:${notification.userId}`, notification);
    });
  }

  async sendNotification(userId: number, notification: object) {
    await pub.publish('notifications', JSON.stringify({
      userId,
      ...notification
    }));
  }
}
```

#### 3. 프론트엔드 실시간 처리
```typescript
// hooks/useRealtime.ts
export function useRealtime() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/stream');

    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);

      switch (notification.type) {
        case 'like':
          // 좋아요 카운트 업데이트
          updateLikeCount(notification.postId, notification.count);
          break;
        case 'comment':
          // 새 댓글 추가
          addNewComment(notification.postId, notification.comment);
          break;
        case 'mention':
          // 멘션 알림 표시
          showMentionNotification(notification);
          break;
      }
    };

    return () => eventSource.close();
  }, []);

  return { notifications };
}
```

#### 4. 성능 최적화 전략
- **Connection Pooling**: 사용자당 하나의 SSE 연결만 유지
- **Event Batching**: 100ms 내의 동일 이벤트들을 배치로 전송
- **Auto Reconnection**: 연결 끊김 시 지수 백오프로 재연결
- **Memory Management**: 비활성 연결 정리 (5분 타임아웃)

---

## 🛠️ API 엔드포인트 설계

### 커뮤니티 게시물 API

```typescript
// 게시물 작성 (타입별 최적화)
POST /api/community/posts
Body: {
  type: 'RECIPE' | 'REVIEW' | 'TIP' | 'QUESTION',
  title: string,
  content: string,

  // 레시피 전용
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD',
  cookingTime?: number,
  servings?: number,
  ingredients?: Array<{name, quantity, unit, isEssential}>,
  instructions?: Array<{step, description, imageUrl?, tips?}>,

  // 리뷰 전용
  rating?: number,
  reviewType?: 'PRODUCT' | 'PLACE' | 'EVENT' | 'MEDIA',
  productId?: number,

  // 공통
  imageUrl?: string,
  images?: string[],
  tags?: string[],
  mentions?: number[] // 사용자 ID 배열
}

// 게시물 목록 (고급 필터링)
GET /api/community/posts
Query: {
  type?: 'RECIPE' | 'REVIEW' | 'TIP' | 'QUESTION',
  tags?: string[], // 태그 필터
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD', // 레시피용
  cookingTimeMax?: number, // 레시피용
  rating?: number, // 리뷰용
  sort?: 'latest' | 'popular' | 'trending',
  search?: string,
  page?: number,
  limit?: number
}

// 게시물 상세
GET /api/community/posts/[id]
Response: {
  ...post,
  isLiked: boolean,
  isBookmarked: boolean,
  author: {
    id, name, badges, followersCount, isFollowing
  },
  relatedPosts: Post[] // 같은 태그/카테고리
}
```

### 상호작용 API

```typescript
// 좋아요/좋아요 취소
POST/DELETE /api/community/posts/[id]/like

// 북마크
POST /api/community/posts/[id]/bookmark
Body: { collectionName?: string }

// 댓글 작성
POST /api/community/posts/[id]/comments
Body: {
  content: string,
  parentId?: number, // 대댓글용
  mentions?: number[]
}

// 댓글 좋아요
POST/DELETE /api/community/comments/[id]/like

// 사용자 팔로우
POST/DELETE /api/community/users/[id]/follow
```

### 검색 및 큐레이션 API

```typescript
// 통합 검색
GET /api/community/search
Query: {
  q: string,
  type?: 'posts' | 'users' | 'tags',
  filters?: object
}

// 트렌딩 태그
GET /api/community/trending/tags

// 추천 게시물
GET /api/community/recommendations
Query: {
  type?: 'for_you' | 'popular' | 'similar',
  basedOn?: number // 특정 게시물 기반 추천
}

// 멘션 자동완성
GET /api/community/users/search
Query: { q: string, limit?: number }
```

---

## 🎨 UI 컴포넌트 구조

### 1. 작성 폼 컴포넌트들

```
components/community/forms/
├── PostTypeSelector.tsx          # 콘텐츠 타입 선택 모달
├── RecipeForm/
│   ├── BasicInfoStep.tsx         # 1단계: 기본 정보
│   ├── IngredientsStep.tsx       # 2단계: 재료
│   ├── InstructionsStep.tsx      # 3단계: 조리 과정
│   └── TipsStep.tsx              # 4단계: 팁과 태그
├── ReviewForm/
│   ├── ProductSelector.tsx       # 상품 선택
│   ├── RatingInput.tsx           # 평점 입력
│   └── ReviewEditor.tsx          # 리뷰 에디터
├── TipForm.tsx                   # 간단한 꿀팁 폼
├── QuestionForm.tsx              # 질문 폼
└── shared/
    ├── ImageUploader.tsx         # 이미지 업로드
    ├── TagInput.tsx              # 태그 입력
    ├── MentionInput.tsx          # 멘션 입력
    └── RichEditor.tsx            # 리치 에디터
```

### 2. 피드 및 표시 컴포넌트들

```
components/community/feed/
├── CommunityFeed.tsx             # 메인 피드
├── PostCard/
│   ├── RecipeCard.tsx            # 레시피 카드
│   ├── ReviewCard.tsx            # 리뷰 카드
│   ├── TipCard.tsx               # 꿀팁 카드
│   └── QuestionCard.tsx          # 질문 카드
├── PostDetail/
│   ├── PostHeader.tsx            # 게시물 헤더
│   ├── PostContent.tsx           # 내용 표시
│   ├── PostActions.tsx           # 좋아요, 북마크 등
│   └── RelatedPosts.tsx          # 관련 게시물
├── FilterBar.tsx                 # 필터 및 정렬
├── SearchBar.tsx                 # 검색바
└── shared/
    ├── UserProfile.tsx           # 사용자 프로필 카드
    ├── TagList.tsx               # 태그 목록
    ├── LikeButton.tsx            # 좋아요 버튼
    └── BookmarkButton.tsx        # 북마크 버튼
```

### 3. 댓글 시스템

```
components/community/comments/
├── CommentSection.tsx            # 댓글 섹션 컨테이너
├── CommentList.tsx               # 댓글 목록
├── CommentItem.tsx               # 개별 댓글
├── CommentForm.tsx               # 댓글 작성 폼
├── ReplyForm.tsx                 # 대댓글 폼
└── CommentActions.tsx            # 댓글 액션 (좋아요, 답글)
```

---

## 📱 모바일 최적화 전략

### 1. 반응형 디자인
- **Mobile First**: 모바일부터 설계 후 데스크톱 확장
- **Touch-friendly**: 최소 44px 터치 영역
- **Swipe 제스처**: 좋아요, 북마크를 스와이프로
- **Pull-to-refresh**: 피드 새로고침

### 2. 성능 최적화
- **Virtual Scrolling**: 긴 피드 최적화
- **Image Lazy Loading**: 이미지 지연 로딩
- **Code Splitting**: 라우트별 코드 분할
- **Offline Support**: PWA로 오프라인 읽기

### 3. 요리 특화 기능
- **Step-by-step Mode**: 요리하면서 보기 좋은 모드
- **Timer Integration**: 조리 시간 타이머
- **Shopping List**: 재료를 쇼핑 리스트로 변환
- **Voice Commands**: 음성으로 다음 단계

---

## 🌟 문화적 감성 디자인 가이드

### 1. 색상 팔레트
```scss
// 한국 전통 색상
$hanbok-red: #d63031;      // 저고리 빨강
$hanbok-blue: #74b9ff;     // 저고리 파랑
$korean-gold: #fdcb6e;     // 한국의 금색
$kimchi-red: #e17055;      // 김치의 빨강
$rice-white: #f8f9fa;      // 쌀의 하얀색
$soy-brown: #6c5ce7;       // 간장의 갈색

// 계절별 테마
$spring-cherry: #fd79a8;   // 봄 - 벚꽃
$summer-green: #00b894;    // 여름 - 초록
$autumn-yellow: #fdcb6e;   // 가을 - 단풍
$winter-blue: #74b9ff;     // 겨울 - 하늘
```

### 2. 타이포그래피
- **헤드라인**: Noto Sans Korean (친근하고 읽기 좋은)
- **본문**: system fonts (성능 최적화)
- **강조**: 500-600 weight로 부드러운 강조
- **한글 특성**: 자간 최적화로 가독성 향상

### 3. 마이크로카피 및 톤앤매너
```typescript
// 친근한 한국어 표현들
const messages = {
  welcome: "안녕하세요! 함께 요리해요 🍳",
  postSuccess: "와! 멋진 레시피네요 👏",
  likeMessage: "이 글이 마음에 드시는군요! ❤️",
  helpfulTip: "도움이 되는 꿀팁이에요 🍯",
  seasonalGreeting: {
    spring: "따뜻한 봄, 새로운 요리는 어때요? 🌸",
    summer: "더운 여름, 시원한 요리로! ❄️",
    autumn: "가을이에요, 따뜻한 국물 요리 🍲",
    winter: "추운 겨울, 뜨끈한 찌개 어때요? 🔥"
  }
}
```

### 4. 일러스트레이션 및 아이콘
- **한국 음식 아이콘**: 김치, 불고기, 비빔밥 등
- **문화 요소**: 젓가락, 한복 패턴, 태극 모티브
- **감정 표현**: 따뜻하고 친근한 일러스트
- **계절감**: 계절별 배경 패턴

---

## 📝 콘텐츠 모더레이션 정책

### 자동화된 모더레이션
- **욕설 필터**: 다국어 욕설 감지 (한국어, 터키어, 영어)
- **스팸 탐지**: 속도 제한, 중복 콘텐츠 감지
- **이미지 모더레이션**: ML 모델을 통한 부적절한 콘텐츠 감지
- **링크 안전성**: 악성 URL 탐지 및 차단

### 커뮤니티 가이드라인
1. **문화적 존중**: 한국 문화를 진정성 있게 감사하며 표현
2. **음식 안전**: 위험하거나 해로운 조리법 금지
3. **상업적 사용**: 홍보성 콘텐츠 제한 (10% 룰)
4. **언어 사용**: 한국어, 터키어, 영어로 정중한 소통
5. **정확성**: 레시피 지침은 명확하고 안전해야 함

### 모더레이션 워크플로우
- **자동 거부**: 명백한 스팸, 욕설, 유해 콘텐츠
- **커뮤니티 신고**: 사용자 신고 시스템과 에스컬레이션
- **모더레이터 검토**: 경계선 케이스의 인간 검토
- **이의 제기 과정**: 콘텐츠 제작자의 결정 이의 제기
- **점진적 제재**: 경고 → 임시 정지 → 영구 정지

### 콘텐츠 큐레이션
- **추천 콘텐츠**: 우수한 게시물 주간 하이라이트
- **계절별 캠페인**: 명절 테마 콘텐츠 홍보
- **전문가 검증**: 검증된 요리사/음식 전문가 배지
- **번역 지원**: 인기 콘텐츠의 커뮤니티 번역

## 🚀 배포 및 모니터링 계획

### 1. 단계별 배포
1. **Alpha (내부)**: 핵심 기능 테스트
2. **Beta (소수 사용자)**: 문화적 적합성 검증
3. **Soft Launch**: 점진적 기능 오픈
4. **Full Launch**: 전체 기능 공개

### 2. A/B 테스트 계획
- **UI 디자인**: 전통적 vs 모던한 디자인
- **톤앤매너**: 존댓말 vs 반말
- **추천 알고리즘**: 인기순 vs 개인화
- **게시물 표시**: 카드형 vs 리스트형

### 3. 구체적 성공 지표 (KPI) 및 목표 수치

#### 📊 Phase 1 목표 (첫 달)
- **DAU (일일 활성 사용자)**: 100명
- **게시물 작성**: 일평균 5개
- **댓글 참여율**: 게시물당 평균 2개
- **사용자 등록**: 월 500명

#### 📈 Phase 2 목표 (3개월)
- **DAU**: 500명
- **게시물 작성**: 일평균 20개
- **댓글 참여율**: 게시물당 평균 5개
- **좋아요 비율**: 게시물의 60% 이상이 1개 이상 좋아요
- **리텐션**: 월간 활성 사용자의 30% 이상이 다음 달도 활동

#### 🎯 Phase 3 목표 (6개월)
- **DAU**: 1,000명
- **콘텐츠 품질**: 평균 댓글 길이 50자 이상
- **문화적 연결**: 멘션 사용률 20% (게시물의 20%에서 멘션 사용)
- **실용성**: 레시피 북마크율 40%, 쇼핑 연결 전환율 5%
- **커뮤니티 성숙도**: 베스트 답변 선정률 30%

#### 📋 세부 측정 지표

**참여도 지표**
- **게시물 작성률**: 등록 사용자 대비 월간 게시물 작성 비율 목표 15%
- **댓글 참여율**: 게시물 조회 대비 댓글 작성 비율 목표 8%
- **세션 시간**: 평균 세션 시간 15분 이상
- **페이지뷰**: 사용자당 월평균 50 페이지뷰

**품질 지표**
- **긍정적 상호작용**: 좋아요/댓글 비율 3:1 이상
- **콘텐츠 완성도**: 이미지 포함 게시물 비율 70% 이상
- **답변 만족도**: 질문 타입 게시물의 답변율 80% 이상
- **신고 비율**: 전체 게시물 대비 신고율 1% 미만

**문화적 연결 지표**
- **멘션 네트워크**: 사용자간 멘션 연결망 밀도
- **지역별 활동**: 이스탄불/앙카라/이즈미르 지역 균형 30:30:20
- **문화 교류**: 한국인-터키인 간 상호작용 비율 40% 이상
- **언어 다양성**: 게시물의 한국어:터키어:영어 비율 5:3:2

**비즈니스 연결 지표**
- **상품 연결률**: 레시피 게시물의 상품 연결 비율 60%
- **구매 전환**: 커뮤니티 → 상품 페이지 → 구매 전환율 3%
- **리뷰 품질**: 상품 리뷰의 평균 길이 100자 이상
- **재방문**: 커뮤니티 방문 후 7일 내 재구매율 15%

이 계획으로 진행하시면 어떨까요?