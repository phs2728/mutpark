import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existingProducts = await prisma.product.count();
  if (existingProducts > 0) {
    console.log("Seed skipped: products already exist.");
    return;
  }

  const baseProducts = [
    {
      sku: "KFOOD-GOCHUJANG-500G",
      slug: "gochujang-500g",
      baseName: "고추장 500g",
      baseDescription: "한국 전통 고추장, 각종 요리에 활용 가능한 다용도 양념입니다.",
      price: 189.9,
      currency: "TRY",
      stock: 120,
      halalCertified: true,
      spiceLevel: 3,
      weightGrams: 500,
      imageUrl:
        "https://images.unsplash.com/photo-1589308078055-079332f0c816?auto=format&fit=crop&w=800&q=80",
      brand: "CJ",
      category: "Sauce",
      translations: {
        create: [
          {
            language: "ko",
            name: "고추장 500g",
            description: "칼칼한 매운맛이 매력적인 전통 고추장입니다.",
          },
          {
            language: "tr",
            name: "Gochujang 500g",
            description: "Farklı yemeklerde kullanılabilen geleneksel Kore biber ezmesi.",
          },
        ],
      },
    },
    {
      sku: "KFOOD-KIMCHI-GLASSJAR",
      slug: "kimchi-traditional",
      baseName: "전통 김치 1kg",
      baseDescription: "최고급 배추로 만든 전통 방식의 김치입니다.",
      price: 249.5,
      currency: "TRY",
      stock: 80,
      halalCertified: true,
      spiceLevel: 4,
      weightGrams: 1000,
      imageUrl:
        "https://images.unsplash.com/photo-1604908176940-3d61aacd3b02?auto=format&fit=crop&w=800&q=80",
      brand: "MutPark",
      category: "SideDish",
      translations: {
        create: [
          {
            language: "ko",
            name: "전통 김치 1kg",
            description: "터키 현지에서 직접 만들어 더욱 신선한 한국 김치",
          },
          {
            language: "tr",
            name: "Geleneksel Kimchi 1kg",
            description: "Yerel olarak hazırlanan taze Kore kimchisi.",
          },
        ],
      },
    },
  ];

  await Promise.all(
    baseProducts.map((product) =>
      prisma.product.create({
        data: product,
      })
    )
  );

  console.log("Seed completed: base products inserted.");

  // Seed community posts
  console.log("🌱 Seeding community posts...");

  // Create some demo users for community posts
  const demoUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: "kimturkey@example.com" },
      update: {},
      create: {
        email: "kimturkey@example.com",
        name: "김터키",
        hashedPassword: "$2a$10$example_hash_1", // placeholder hash
        role: "USER",
        isEmailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "istanbulkim@example.com" },
      update: {},
      create: {
        email: "istanbulkim@example.com",
        name: "이스탄불김씨",
        hashedPassword: "$2a$10$example_hash_2", // placeholder hash
        role: "USER",
        isEmailVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "ankarakorean@example.com" },
      update: {},
      create: {
        email: "ankarakorean@example.com",
        name: "앙카라한국인",
        hashedPassword: "$2a$10$example_hash_3", // placeholder hash
        role: "USER",
        isEmailVerified: true,
      },
    }),
  ]);

  console.log(`Created ${demoUsers.length} demo users`);

  // Find a product for the review post
  const sampleProduct = await prisma.product.findFirst({
    where: {
      baseName: { contains: "신라면" }
    }
  });

  // Create community posts
  const communityPosts = await Promise.all([
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[0].id,
        type: "RECIPE",
        title: "터키에서 만드는 정통 김치찌개",
        content: "터키에서 구할 수 있는 재료들로 맛있는 김치찌개를 만드는 방법을 공유해요! 현지 슈퍼마켓에서 쉽게 찾을 수 있는 재료들을 사용했습니다. 터키의 신 양배추(Turşu lahana)를 사용하면 김치와 비슷한 맛을 낼 수 있어요.",
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
        content: "드디어 찾았던 신라면 블랙! 맛이 정말 진하고 좋아요. 터키에서 이런 맛을 느낄 수 있다니 감동입니다. 특히 국물이 정말 깊고 진해서 한국이 그리울 때 먹기 좋아요. MutPark에서 주문한 지 3일 만에 받았고 포장도 완벽했습니다.",
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

  console.log(`Created ${communityPosts.length} community posts`);

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

  console.log(`Created ${likes.length} post likes`);
  console.log("✅ Community seeding completed successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
