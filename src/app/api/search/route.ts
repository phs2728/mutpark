import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!q || q.trim().length < 2) {
      return successResponse({
        products: [],
        total: 0,
        hasMore: false,
      });
    }

    const searchQuery = q.trim();

    // Build where clause
    const whereClause: any = {
      AND: [
        {
          OR: [
            {
              baseName: {
                contains: searchQuery,
              },
            },
            {
              baseDescription: {
                contains: searchQuery,
              },
            },
            {
              category: {
                contains: searchQuery,
              },
            },
          ],
        },
      ],
    };

    // Add category filter if specified
    if (category && category !== "all") {
      whereClause.AND.push({
        category: {
          contains: category,
        },
      });
    }

    // Get total count
    const totalCount = await prisma.product.count({
      where: whereClause,
    });

    // Get products with pagination
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
          take: 1,
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        translations: {
          where: {
            language: "ko",
          },
          take: 1,
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      take: limit,
      skip: offset,
    });

    // Calculate average ratings
    const productsWithRatings = products.map((product) => {
      const ratings = product.reviews.map((review) => review.rating);
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

      const translation = product.translations[0];
      const displayName = translation?.name || product.baseName;
      const displayDescription = translation?.description || product.baseDescription;

      return {
        id: product.id,
        name: displayName,
        description: displayDescription,
        price: product.price,
        slug: product.slug,
        category: {
          name: product.category || "기타",
          slug: product.category?.toLowerCase().replace(/\s+/g, '-') || "other",
        },
        image: product.images[0]?.url || product.imageUrl || null,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: product.reviews.length,
        featured: false, // 기본값
        stock: product.stock,
      };
    });

    return successResponse({
      products: productsWithRatings,
      total: totalCount,
      hasMore: offset + limit < totalCount,
      query: searchQuery,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return errorResponse("검색 중 오류가 발생했습니다", 500);
  }
}