import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function parseProductId(id: string) {
  const parsed = Number(id);
  if (Number.isNaN(parsed)) {
    throw new Error("INVALID_ID");
  }
  return parsed;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const productId = parseProductId(id);

    // 먼저 현재 상품 정보를 가져와서 카테고리를 확인합니다
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        category: true,
        brand: true,
        price: true,
      },
    });

    if (!currentProduct) {
      return errorResponse("Product not found", 404);
    }

    // 관련 상품 추천 로직:
    // 1. 같은 카테고리의 상품
    // 2. 같은 브랜드의 상품 (있다면)
    // 3. 비슷한 가격대의 상품
    // 4. 현재 상품은 제외
    const priceMin = currentProduct.price * 0.7; // 현재 가격의 70%
    const priceMax = currentProduct.price * 1.3; // 현재 가격의 130%

    const relatedProducts = await prisma.product.findMany({
      where: {
        AND: [
          { id: { not: productId } }, // 현재 상품 제외
          {
            OR: [
              // 같은 카테고리
              currentProduct.category ? { category: currentProduct.category } : {},
              // 같은 브랜드
              currentProduct.brand ? { brand: currentProduct.brand } : {},
              // 비슷한 가격대
              {
                price: {
                  gte: priceMin,
                  lte: priceMax,
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        slug: true,
        baseName: true,
        price: true,
        currency: true,
        imageUrl: true,
        halalCertified: true,
        spiceLevel: true,
        stock: true,
        category: true,
        brand: true,
        translations: {
          select: {
            language: true,
            name: true,
          },
        },
      },
      take: 8, // 최대 8개의 관련 상품
      orderBy: [
        // 같은 카테고리 우선
        { category: currentProduct.category ? "asc" : "desc" },
        // 같은 브랜드 우선
        { brand: currentProduct.brand ? "asc" : "desc" },
        // 가격 차이가 적은 순
        { price: "asc" },
      ],
    });

    // 결과 포맷팅
    const formattedProducts = relatedProducts.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.translations[0]?.name || product.baseName,
      price: Number(product.price),
      currency: product.currency,
      imageUrl: product.imageUrl,
      halalCertified: product.halalCertified,
      spiceLevel: product.spiceLevel,
      stock: product.stock,
      category: product.category,
      brand: product.brand,
      translations: product.translations,
    }));

    return successResponse({
      products: formattedProducts,
      total: formattedProducts.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") {
      return errorResponse("Invalid product id", 400);
    }
    console.error("Related products API error:", error);
    return errorResponse("Unable to load related products", 500);
  }
}