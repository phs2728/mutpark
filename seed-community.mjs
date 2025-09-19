import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCommunity() {
  console.log("🌱 Seeding community data...");

  // Create demo users for community posts
  const demoUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: "kimturkey@example.com" },
      update: {},
      create: {
        email: "kimturkey@example.com",
        name: "김터키",
        passwordHash: "$2a$10$example_hash_1", // placeholder hash
        role: "CUSTOMER",
      },
    }),
    prisma.user.upsert({
      where: { email: "istanbulkim@example.com" },
      update: {},
      create: {
        email: "istanbulkim@example.com",
        name: "이스탄불김씨",
        passwordHash: "$2a$10$example_hash_2", // placeholder hash
        role: "CUSTOMER",
      },
    }),
    prisma.user.upsert({
      where: { email: "ankarakorean@example.com" },
      update: {},
      create: {
        email: "ankarakorean@example.com",
        name: "앙카라한국인",
        passwordHash: "$2a$10$example_hash_3", // placeholder hash
        role: "CUSTOMER",
      },
    }),
  ]);

  console.log(`✅ Created/updated ${demoUsers.length} demo users`);

  // Find a product for the review post
  const sampleProduct = await prisma.product.findFirst({
    where: {
      baseName: { contains: "신라면" }
    }
  });

  // Delete existing community posts if any
  await prisma.communityPostLike.deleteMany({});
  await prisma.communityPostComment.deleteMany({});
  await prisma.communityPost.deleteMany({});

  // Create community posts
  const communityPosts = await Promise.all([
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[0].id,
        type: "RECIPE",
        title: "터키에서 만드는 정통 김치찌개",
        content: "터키에서 구할 수 있는 재료들로 맛있는 김치찌개를 만드는 방법을 공유해요! 현지 슈퍼마켓에서 쉽게 찾을 수 있는 재료들을 사용했습니다.",
        tags: ["김치찌개", "터키현지화", "쉬운레시피", "한식"],
        likesCount: 24,
        commentsCount: 8,
        publishedAt: new Date("2025-01-15T10:30:00Z"),
        status: "PUBLISHED",
      },
    }),
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[1].id,
        type: "REVIEW",
        title: "신라면 블랙 후기",
        content: "드디어 찾았던 신라면 블랙! 맛이 정말 진하고 좋아요. 터키에서 이런 맛을 느낄 수 있다니 감동입니다.",
        productId: sampleProduct?.id,
        tags: ["라면", "농심", "추천", "후기"],
        likesCount: 15,
        commentsCount: 12,
        publishedAt: new Date("2025-01-14T15:20:00Z"),
        status: "PUBLISHED",
      },
    }),
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[2].id,
        type: "TIP",
        title: "터키에서 한국 재료 구하는 꿀팁",
        content: "아시안 마켓 외에도 일반 슈퍼마켓에서 구할 수 있는 대체 재료들과 온라인 쇼핑몰 정보를 정리했어요! 1) 고추장 대신 터키의 Biber salçası + 설탕 2) 된장 대신 Miso paste (일부 Migros에서 판매) 3) 김치 대신 Turşu lahana 4) 참기름 대신 Susam yağı 등등... 더 많은 팁이 있으니 댓글로 공유해주세요!",
        tags: ["꿀팁", "쇼핑", "재료구하기", "터키", "한식재료"],
        likesCount: 35,
        commentsCount: 22,
        publishedAt: new Date("2025-01-13T12:45:00Z"),
        status: "PUBLISHED",
      },
    }),
  ]);

  console.log(`✅ Created ${communityPosts.length} community posts`);

  // Create some likes for the posts
  const likes = await Promise.all([
    // Some users like the recipe post
    prisma.communityPostLike.create({
      data: {
        postId: communityPosts[0].id,
        userId: demoUsers[1].id,
      },
    }),
    prisma.communityPostLike.create({
      data: {
        postId: communityPosts[0].id,
        userId: demoUsers[2].id,
      },
    }),
    // Some users like the review post
    prisma.communityPostLike.create({
      data: {
        postId: communityPosts[1].id,
        userId: demoUsers[0].id,
      },
    }),
    // Some users like the tip post
    prisma.communityPostLike.create({
      data: {
        postId: communityPosts[2].id,
        userId: demoUsers[0].id,
      },
    }),
    prisma.communityPostLike.create({
      data: {
        postId: communityPosts[2].id,
        userId: demoUsers[1].id,
      },
    }),
  ]);

  console.log(`✅ Created ${likes.length} post likes`);

  // Create some comments
  const comments = await Promise.all([
    prisma.communityPostComment.create({
      data: {
        postId: communityPosts[0].id,
        userId: demoUsers[1].id,
        content: "와 정말 좋은 아이디어네요! 터키 재료로도 김치찌개가 이렇게 맛있게 될 줄 몰랐어요. 꼭 해봐야겠습니다!",
      },
    }),
    prisma.communityPostComment.create({
      data: {
        postId: communityPosts[1].id,
        userId: demoUsers[0].id,
        content: "신라면 블랙 정말 맛있죠! 저도 MutPark에서 자주 주문해요. 배송도 빠르고 포장도 잘 되어있어서 믿고 삽니다.",
      },
    }),
    prisma.communityPostComment.create({
      data: {
        postId: communityPosts[2].id,
        userId: demoUsers[1].id,
        content: "정말 유용한 정보 감사해요! 특히 Biber salçası 팁은 처음 알았네요. 당장 시도해보겠습니다.",
      },
    }),
  ]);

  console.log(`✅ Created ${comments.length} comments`);
  console.log("🎉 Community seeding completed successfully!");
}

seedCommunity()
  .catch((error) => {
    console.error("❌ Community seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });