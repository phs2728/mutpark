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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
