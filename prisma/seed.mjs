import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check if we need to add products
  const existingProducts = await prisma.product.count();
  let shouldSeedProducts = existingProducts === 0;

  // Check if we need to add community data
  const existingCommunityPosts = await prisma.communityPost.count();
  let shouldSeedCommunity = existingCommunityPosts === 0;

  // Check if we need to add events
  const existingEvents = await prisma.event.count();
  let shouldSeedEvents = existingEvents === 0;

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
    {
      sku: "NONGSHIM-SHINRAMYUN-BLACK",
      slug: "shinramyun-black",
      baseName: "신라면 블랙 5입",
      baseDescription: "진하고 깊은 맛의 프리미엄 신라면입니다.",
      price: 159.9,
      currency: "TRY",
      stock: 200,
      halalCertified: false,
      spiceLevel: 4,
      weightGrams: 650,
      imageUrl:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
      brand: "농심",
      category: "InstantFood",
      translations: {
        create: [
          {
            language: "ko",
            name: "신라면 블랙 5입",
            description: "프리미엄 육수로 깊은 맛을 자랑하는 신라면 블랙",
          },
          {
            language: "tr",
            name: "Shin Ramyun Black 5'li",
            description: "Premium et suyuyla derin lezzet sunan Shin Ramyun Black",
          },
        ],
      },
    },
    {
      sku: "KFOOD-SESAME-OIL-320ML",
      slug: "sesame-oil-320ml",
      baseName: "참기름 320ml",
      baseDescription: "100% 순참깨로 만든 고소한 참기름입니다.",
      price: 129.9,
      currency: "TRY",
      stock: 150,
      halalCertified: true,
      spiceLevel: 0,
      weightGrams: 320,
      imageUrl:
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
      brand: "오뚜기",
      category: "Sauce",
      translations: {
        create: [
          {
            language: "ko",
            name: "참기름 320ml",
            description: "고소하고 진한 100% 순참깨 기름",
          },
          {
            language: "tr",
            name: "Susam Yağı 320ml",
            description: "%100 saf susam ile yapılan aromalı susam yağı",
          },
        ],
      },
    },
    {
      sku: "KFOOD-DOENJANG-1KG",
      slug: "doenjang-1kg",
      baseName: "된장 1kg",
      baseDescription: "전통 방식으로 발효시킨 깊은 맛의 된장입니다.",
      price: 199.9,
      currency: "TRY",
      stock: 90,
      halalCertified: true,
      spiceLevel: 0,
      weightGrams: 1000,
      imageUrl:
        "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=800&q=80",
      brand: "청정원",
      category: "Sauce",
      translations: {
        create: [
          {
            language: "ko",
            name: "된장 1kg",
            description: "전통 발효로 만든 구수한 된장",
          },
          {
            language: "tr",
            name: "Doenjang 1kg",
            description: "Geleneksel fermentasyon ile yapılan lezzetli soya fasulyesi ezmesi",
          },
        ],
      },
    },
    {
      sku: "KFOOD-KOREAN-RICE-5KG",
      slug: "korean-rice-5kg",
      baseName: "한국쌀 5kg",
      baseDescription: "부드럽고 찰진 프리미엄 한국쌀입니다.",
      price: 289.9,
      currency: "TRY",
      stock: 50,
      halalCertified: true,
      spiceLevel: 0,
      weightGrams: 5000,
      imageUrl:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
      brand: "임금님표",
      category: "Grain",
      translations: {
        create: [
          {
            language: "ko",
            name: "프리미엄 한국쌀 5kg",
            description: "찰지고 고소한 최고급 한국쌀",
          },
          {
            language: "tr",
            name: "Premium Kore Pirinci 5kg",
            description: "Yapışkan ve lezzetli birinci sınıf Kore pirinci",
          },
        ],
      },
    },
  ];

  // Seed products if needed
  if (shouldSeedProducts) {
    await Promise.all(
      baseProducts.map((product) =>
        prisma.product.create({
          data: product,
        })
      )
    );
    console.log("Seed completed: base products inserted.");
  } else {
    console.log("Seed skipped: products already exist.");
  }

  // Seed community posts if needed
  if (shouldSeedCommunity) {
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
    // RECIPE posts
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[0].id,
        type: "RECIPE",
        title: "터키에서 만드는 정통 김치찌개",
        content: "터키에서 구할 수 있는 재료들로 맛있는 김치찌개를 만드는 방법을 공유해요! 현지 슈퍼마켓에서 쉽게 찾을 수 있는 재료들을 사용했습니다. 터키의 신 양배추(Turşu lahana)를 사용하면 김치와 비슷한 맛을 낼 수 있어요.",
        tags: ["김치찌개", "터키현지화", "쉬운레시피", "한식"],
        difficulty: "MEDIUM",
        cookingTime: 45,
        servings: 4,
        ingredients: JSON.stringify([
          {id: "1", name: "신김치", quantity: "300", unit: "g", isEssential: true},
          {id: "2", name: "돼지고기", quantity: "200", unit: "g", isEssential: true},
          {id: "3", name: "두부", quantity: "1", unit: "모", isEssential: false},
          {id: "4", name: "대파", quantity: "2", unit: "대", isEssential: true}
        ]),
        instructions: JSON.stringify([
          {id: "1", step: 1, description: "김치를 먹기 좋은 크기로 자르고 돼지고기도 한입 크기로 자릅니다."},
          {id: "2", step: 2, description: "팬에 기름을 두르고 돼지고기를 볶아줍니다."},
          {id: "3", step: 3, description: "김치를 넣고 함께 볶아 김치의 신맛을 날려줍니다."},
          {id: "4", step: 4, description: "물을 넣고 끓인 후 두부와 대파를 넣어 마무리합니다."}
        ]),
        likesCount: 24,
        commentsCount: 8,
        publishedAt: new Date("2025-01-15T10:30:00Z"),
        status: "PUBLISHED",
      },
    }),
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[2].id,
        type: "RECIPE",
        title: "터키식 비빔밥 만들기",
        content: "터키에서 구할 수 있는 재료로 만드는 건강한 비빔밥입니다. 현지 야채들을 활용해서 색다른 맛을 만들어보세요!",
        tags: ["비빔밥", "건강식", "야채", "터키현지화"],
        difficulty: "EASY",
        cookingTime: 30,
        servings: 2,
        ingredients: JSON.stringify([
          {id: "1", name: "밥", quantity: "2", unit: "공기", isEssential: true},
          {id: "2", name: "당근", quantity: "1", unit: "개", isEssential: true},
          {id: "3", name: "시금치", quantity: "100", unit: "g", isEssential: true},
          {id: "4", name: "고추장", quantity: "2", unit: "큰술", isEssential: true}
        ]),
        instructions: JSON.stringify([
          {id: "1", step: 1, description: "야채들을 각각 데쳐서 양념합니다."},
          {id: "2", step: 2, description: "밥 위에 야채들을 예쁘게 올립니다."},
          {id: "3", step: 3, description: "고추장을 넣고 잘 비벼서 드시면 됩니다."}
        ]),
        likesCount: 18,
        commentsCount: 5,
        publishedAt: new Date("2025-01-12T14:20:00Z"),
        status: "PUBLISHED",
      },
    }),
    // REVIEW posts
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[1].id,
        type: "REVIEW",
        title: "신라면 블랙 후기",
        content: "드디어 찾았던 신라면 블랙! 맛이 정말 진하고 좋아요. 터키에서 이런 맛을 느낄 수 있다니 감동입니다. 특히 국물이 정말 깊고 진해서 한국이 그리울 때 먹기 좋아요. MutPark에서 주문한 지 3일 만에 받았고 포장도 완벽했습니다.",
        productId: sampleProduct?.id,
        rating: 5,
        reviewType: "PRODUCT",
        tags: ["라면", "농심", "추천", "후기"],
        likesCount: 15,
        commentsCount: 12,
        publishedAt: new Date("2025-01-14T15:20:00Z"),
        status: "PUBLISHED",
      },
    }),
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[0].id,
        type: "REVIEW",
        title: "이스탄불 한식당 '서울키친' 후기",
        content: "이스탄불에 새로 생긴 한식당에 다녀왔어요! 김치찌개 맛이 정말 한국 맛과 똑같았습니다. 가격은 조금 비싸지만 그만한 값어치를 하는 것 같아요. 특히 반찬들이 정말 맛있었고, 김치도 직접 담그신다고 하네요.",
        rating: 4,
        reviewType: "PLACE",
        location: "이스탄불 베식타스",
        tags: ["한식당", "이스탄불", "맛집", "추천"],
        likesCount: 28,
        commentsCount: 15,
        publishedAt: new Date("2025-01-11T19:30:00Z"),
        status: "PUBLISHED",
      },
    }),
    // TIP posts
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
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[1].id,
        type: "TIP",
        title: "한국 드라마 보며 터키어 배우기",
        content: "한국 드라마를 터키어 자막으로 보면서 자연스럽게 터키어를 배울 수 있어요! Netflix에서 한국 드라마에 터키어 자막이 있는 작품들을 정리해봤습니다. '사랑의 불시착', '오징어 게임', '킹덤' 등이 터키어 자막을 지원해요.",
        tags: ["터키어", "한국드라마", "언어교환", "넷플릭스"],
        likesCount: 42,
        commentsCount: 18,
        publishedAt: new Date("2025-01-10T16:15:00Z"),
        status: "PUBLISHED",
      },
    }),
    // QUESTION posts
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[0].id,
        type: "QUESTION",
        title: "터키에서 떡 만들기 가능할까요?",
        content: "한국 떡이 너무 먹고 싶은데 터키에서 만들 수 있는 방법이 있을까요? 쌀가루는 어디서 구할 수 있는지, 그리고 떡 만드는 도구들은 어떤 걸로 대체할 수 있는지 궁금합니다. 경험 있으신 분들 조언 부탁드려요!",
        tags: ["떡", "쌀가루", "한국간식", "만들기"],
        likesCount: 12,
        commentsCount: 8,
        publishedAt: new Date("2025-01-09T11:20:00Z"),
        status: "PUBLISHED",
      },
    }),
    prisma.communityPost.create({
      data: {
        authorId: demoUsers[2].id,
        type: "QUESTION",
        title: "터키 현지인 친구에게 한국 음식 소개하기",
        content: "터키 친구들이 한국 음식에 관심이 많은데, 터키인 입맛에 맞는 한국 음식을 추천해주고 싶어요. 너무 맵지 않고 터키 사람들이 좋아할 만한 한국 요리가 뭐가 있을까요? 실제로 터키 친구들에게 해드신 분들의 경험담을 듣고 싶습니다!",
        tags: ["문화교류", "터키친구", "음식추천", "현지화"],
        likesCount: 20,
        commentsCount: 14,
        publishedAt: new Date("2025-01-08T13:45:00Z"),
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
  } else {
    console.log("Seed skipped: community posts already exist.");
  }

  // Seed events
  if (shouldSeedEvents) {
    console.log("🎉 Seeding events...");

    // Create an admin user for events if not exists
    let adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: "admin@mutpark.com",
          passwordHash: "$2b$10$example_hash_for_admin_user",
          name: "관리자",
          role: "ADMIN",
          locale: "ko",
          currency: "TRY",
        }
      });
    }

    const events = await Promise.all([
      prisma.event.create({
        data: {
          name: "추석 전통음식 챌린지",
          description: "집에서 만드는 추석 전통음식 레시피를 공유하고 따뜻한 마음을 나눠요. 전통 요리를 통해 한국 문화를 터키에서도 함께 즐겨보세요.",
          type: "CHALLENGE",
          status: "ENDED",
          startDate: new Date("2024-09-15T00:00:00Z"),
          endDate: new Date("2024-09-18T23:59:59Z"),
          icon: "🥮",
          theme: "bg-gradient-to-br from-yellow-100 to-orange-100 border-orange-200",
          rewards: [
            "특별 배지: 전통음식 마스터",
            "한국 전통차 세트",
            "커뮤니티 명예의 전당"
          ],
          participantCount: 127,
          createdById: adminUser.id,
          featured: true,
          metadata: {
            hashtags: ["추석", "전통음식", "레시피"],
            difficulty: "중급"
          }
        }
      }),
      prisma.event.create({
        data: {
          name: "김장철 대회",
          description: "터키에서도 맛있는 김치 담그기! 나만의 김치 레시피와 노하우를 공유해주세요. 겨울을 준비하는 한국의 전통을 함께 나누어요.",
          type: "CONTEST",
          status: "ACTIVE",
          startDate: new Date("2024-11-20T00:00:00Z"),
          endDate: new Date("2024-12-10T23:59:59Z"),
          icon: "🥬",
          theme: "bg-gradient-to-br from-green-100 to-red-100 border-green-200",
          rewards: [
            "우승자: 한국식품 패키지",
            "특별 배지: 김치 마스터",
            "김치냉장고 할인 쿠폰"
          ],
          participantCount: 89,
          maxParticipants: 200,
          createdById: adminUser.id,
          featured: true,
          metadata: {
            hashtags: ["김장", "김치", "겨울준비"],
            judging: "커뮤니티 투표"
          }
        }
      }),
      prisma.event.create({
        data: {
          name: "설날 떡국 축제",
          description: "새해를 맞이하여 전통 떡국과 함께하는 축제입니다. 각자의 특별한 떡국 레시피를 공유하고 새해 복을 나누어요.",
          type: "CELEBRATION",
          status: "UPCOMING",
          startDate: new Date("2025-01-28T00:00:00Z"),
          endDate: new Date("2025-02-02T23:59:59Z"),
          icon: "🍜",
          theme: "bg-gradient-to-br from-red-100 to-pink-100 border-red-200",
          rewards: [
            "새해 복 배지",
            "전통 떡 선물세트",
            "한국 전통 그릇 세트"
          ],
          participantCount: 0,
          createdById: adminUser.id,
          featured: true,
          metadata: {
            hashtags: ["설날", "떡국", "새해"],
            category: "명절음식"
          }
        }
      }),
      prisma.event.create({
        data: {
          name: "봄맞이 나물반찬 특집",
          description: "봄철 건강한 나물반찬으로 가족 건강을 챙겨보세요. 제철 재료를 활용한 다양한 나물 요리법을 공유합니다.",
          type: "CHALLENGE",
          status: "UPCOMING",
          startDate: new Date("2025-03-15T00:00:00Z"),
          endDate: new Date("2025-04-15T23:59:59Z"),
          icon: "🌱",
          theme: "bg-gradient-to-br from-green-100 to-yellow-100 border-green-200",
          rewards: [
            "건강 요리사 배지",
            "유기농 재료 할인 쿠폰",
            "나물 요리 도구 세트"
          ],
          participantCount: 0,
          maxParticipants: 150,
          createdById: adminUser.id,
          metadata: {
            hashtags: ["봄", "나물", "건강"],
            season: "spring"
          }
        }
      }),
      prisma.event.create({
        data: {
          name: "터키 현지재료 활용 대회",
          description: "터키에서 구할 수 있는 현지 재료로 한국 요리를 만들어보는 창의적인 대회입니다. 로컬 푸드로 K-푸드를 재해석해보세요!",
          type: "CONTEST",
          status: "UPCOMING",
          startDate: new Date("2025-05-01T00:00:00Z"),
          endDate: new Date("2025-05-31T23:59:59Z"),
          icon: "🇹🇷",
          theme: "bg-gradient-to-br from-blue-100 to-red-100 border-blue-200",
          rewards: [
            "크리에이티브 셰프 배지",
            "터키-한국 요리 도구 세트",
            "현지 식재료 탐방 투어"
          ],
          participantCount: 0,
          maxParticipants: 100,
          createdById: adminUser.id,
          featured: false,
          metadata: {
            hashtags: ["터키", "현지재료", "창의"],
            collaboration: "터키-한국 문화교류"
          }
        }
      })
    ]);

    console.log(`Created ${events.length} events`);
    console.log("✅ Events seeding completed successfully");
  } else {
    console.log("Seed skipped: events already exist.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
