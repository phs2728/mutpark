import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addMoreCommunityData() {
  console.log("🌱 Adding more Korean food community data...");

  // Find existing users or create demo users
  const demoUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: "kimturkey@example.com" },
      update: {},
      create: {
        email: "kimturkey@example.com",
        name: "김터키",
        passwordHash: "$2a$10$example_hash_1",
        role: "CUSTOMER",
      },
    }),
    prisma.user.upsert({
      where: { email: "istanbulkim@example.com" },
      update: {},
      create: {
        email: "istanbulkim@example.com",
        name: "이스탄불김씨",
        passwordHash: "$2a$10$example_hash_2",
        role: "CUSTOMER",
      },
    }),
    prisma.user.upsert({
      where: { email: "ankarakorean@example.com" },
      update: {},
      create: {
        email: "ankarakorean@example.com",
        name: "앙카라한국인",
        passwordHash: "$2a$10$example_hash_3",
        role: "CUSTOMER",
      },
    }),
    prisma.user.upsert({
      where: { email: "izmirkorean@example.com" },
      update: {},
      create: {
        email: "izmirkorean@example.com",
        name: "이즈미르한국인",
        passwordHash: "$2a$10$example_hash_4",
        role: "CUSTOMER",
      },
    }),
  ]);

  console.log(`✅ Found/Created ${demoUsers.length} users`);

  // Get a sample product for reviews
  const sampleProduct = await prisma.product.findFirst({
    where: {
      baseName: { contains: "고추장" }
    }
  });

  // Add more community posts
  const newPosts = await Promise.all([
    // More RECIPE posts
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[1].id,
        type: "RECIPE",
        title: "터키에서 쉽게 만드는 한국식 계란찜",
        content: "터키 현지 재료로 만드는 부드러운 계란찜 레시피입니다. 터키에서 구하기 쉬운 재료들만 사용해서 누구나 쉽게 만들 수 있어요!",
        tags: ["계란찜", "쉬운요리", "터키현지화", "반찬"],
        difficulty: "EASY",
        cookingTime: 15,
        servings: 2,
        ingredients: JSON.stringify([
          {id: "1", name: "계란", quantity: "4", unit: "개", isEssential: true},
          {id: "2", name: "물", quantity: "100", unit: "ml", isEssential: true},
          {id: "3", name: "소금", quantity: "1", unit: "꼬집", isEssential: true},
          {id: "4", name: "대파", quantity: "1", unit: "대", isEssential: false}
        ]),
        instructions: JSON.stringify([
          {id: "1", step: 1, description: "계란을 잘 풀어주세요."},
          {id: "2", step: 2, description: "물과 소금을 넣고 잘 섞어주세요."},
          {id: "3", step: 3, description: "전자레인지나 찜기에 8-10분간 조리하면 완성!"}
        ]),
        likesCount: 15,
        commentsCount: 6,
        publishedAt: new Date("2025-01-16T09:15:00Z"),
        status: "PUBLISHED",
      },
    }),
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[3].id,
        type: "RECIPE",
        title: "터키식 김밥 - Kore Suşi",
        content: "터키 친구들에게도 인기 만점인 김밥 레시피! 터키에서 구할 수 있는 재료들로 맛있는 김밥을 만들어보세요. 터키인들도 정말 좋아해요!",
        tags: ["김밥", "터키친구", "문화교류", "점심도시락"],
        difficulty: "MEDIUM",
        cookingTime: 60,
        servings: 4,
        ingredients: JSON.stringify([
          {id: "1", name: "김", quantity: "10", unit: "장", isEssential: true},
          {id: "2", name: "밥", quantity: "3", unit: "공기", isEssential: true},
          {id: "3", name: "단무지", quantity: "100", unit: "g", isEssential: true},
          {id: "4", name: "당근", quantity: "1", unit: "개", isEssential: true},
          {id: "5", name: "시금치", quantity: "100", unit: "g", isEssential: true}
        ]),
        instructions: JSON.stringify([
          {id: "1", step: 1, description: "밥에 참기름과 소금을 넣고 양념합니다."},
          {id: "2", step: 2, description: "야채들을 각각 조리해서 준비합니다."},
          {id: "3", step: 3, description: "김 위에 밥과 재료를 올리고 돌돌 말아줍니다."},
          {id: "4", step: 4, description: "먹기 좋은 크기로 썰어서 완성!"}
        ]),
        likesCount: 32,
        commentsCount: 12,
        publishedAt: new Date("2025-01-17T14:30:00Z"),
        status: "PUBLISHED",
      },
    }),
    // More REVIEW posts
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[2].id,
        type: "REVIEW",
        title: "터키 현지 고추장 맛 비교 후기",
        content: "여러 브랜드 고추장을 써본 후기를 공유해요! CJ, 청정원, 해찬들 등을 비교해봤는데 각각 특징이 달라서 용도별로 나눠 쓰는 게 좋을 것 같아요.",
        productId: sampleProduct?.id,
        rating: 4,
        reviewType: "PRODUCT",
        tags: ["고추장", "브랜드비교", "리뷰", "양념"],
        likesCount: 18,
        commentsCount: 9,
        publishedAt: new Date("2025-01-18T11:20:00Z"),
        status: "PUBLISHED",
      },
    }),
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[0].id,
        type: "REVIEW",
        title: "앙카라 한국문화원 김치 만들기 클래스 후기",
        content: "한국문화원에서 김치 만들기 클래스를 들었는데 정말 좋았어요! 선생님이 친절하게 알려주시고, 직접 만든 김치도 가져갈 수 있어서 좋았습니다. 터키 현지 재료로 김치 맛을 내는 방법도 배웠어요.",
        rating: 5,
        reviewType: "EVENT",
        tags: ["김치", "클래스", "한국문화원", "요리교실"],
        likesCount: 25,
        commentsCount: 7,
        publishedAt: new Date("2025-01-19T16:45:00Z"),
        status: "PUBLISHED",
      },
    }),
    // More TIP posts
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[1].id,
        type: "TIP",
        title: "터키 슈퍼마켓에서 한국 요리용 야채 구하기",
        content: "터키 현지 슈퍼마켓에서 한국 요리에 쓸 수 있는 야채들을 정리해봤어요! 1) 무 = Turp 2) 배추 = Lahana 3) 시금치 = Ispanak 4) 콩나물 = Fasulye filizi (일부 Migros에서 판매) 5) 미나리 = Su teresi (비슷한 맛) 등등 더 많은 정보가 있으니 댓글로 공유해주세요!",
        tags: ["야채", "터키슈퍼마켓", "쇼핑가이드", "현지화"],
        likesCount: 45,
        commentsCount: 23,
        publishedAt: new Date("2025-01-20T10:10:00Z"),
        status: "PUBLISHED",
      },
    }),
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[3].id,
        type: "TIP",
        title: "한국 음식 주문할 때 터키어 단어 모음",
        content: "터키에서 한국 음식 주문할 때 유용한 터키어 단어들을 모아봤어요! 매운맛 = Acı, 덜 맵게 = Az acı, 많이 맵게 = Çok acı, 밥 추가 = Ekstra pilav, 국물 많이 = Bol çorba 등등. 터키 현지 한식당에서 주문할 때 써보세요!",
        tags: ["터키어", "주문", "한식당", "언어팁"],
        likesCount: 38,
        commentsCount: 15,
        publishedAt: new Date("2025-01-21T13:25:00Z"),
        status: "PUBLISHED",
      },
    }),
    // More QUESTION posts
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[0].id,
        type: "QUESTION",
        title: "터키에서 간장게장 만들 수 있을까요?",
        content: "터키에서 신선한 꽃게를 구할 수 있는 곳이 있는지, 그리고 간장게장 만들 때 필요한 재료들을 현지에서 구할 수 있는지 궁금해요. 바닷가 도시에서는 가능할까요? 경험 있으신 분들 조언 부탁드려요!",
        tags: ["간장게장", "꽃게", "해산물", "터키현지"],
        likesCount: 8,
        commentsCount: 5,
        publishedAt: new Date("2025-01-22T15:40:00Z"),
        status: "PUBLISHED",
      },
    }),
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[2].id,
        type: "QUESTION",
        title: "터키인 남편에게 한국 음식 어떻게 소개하셨나요?",
        content: "터키인 남편이 한국 음식에 관심을 보이는데, 어떤 음식부터 시작하는 게 좋을까요? 너무 맵거나 자극적이지 않으면서도 터키 사람들이 좋아할 만한 한국 음식 추천해주세요. 국제결혼 경험자분들의 조언이 궁금합니다!",
        tags: ["국제결혼", "터키남편", "음식소개", "문화적응"],
        likesCount: 22,
        commentsCount: 18,
        publishedAt: new Date("2025-01-23T12:15:00Z"),
        status: "PUBLISHED",
      },
    }),
  ]);

  console.log(`✅ Created ${newPosts.length} new community posts`);

  // Add some likes for the new posts
  const newLikes = await Promise.all([
    // Random likes from different users
    prisma.communityPostLike.create({
      data: {
        postId: newPosts[0].id,
        userId: demoUsers[2].id,
      },
    }),
    prisma.communityPostLike.create({
      data: {
        postId: newPosts[1].id,
        userId: demoUsers[0].id,
      },
    }),
    prisma.communityPostLike.create({
      data: {
        postId: newPosts[2].id,
        userId: demoUsers[1].id,
      },
    }),
    prisma.communityPostLike.create({
      data: {
        postId: newPosts[3].id,
        userId: demoUsers[3].id,
      },
    }),
  ]);

  console.log(`✅ Created ${newLikes.length} new post likes`);
  console.log("🎉 Successfully added more Korean food community data!");
}

addMoreCommunityData()
  .catch((error) => {
    console.error("Error adding community data:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });