import { NextRequest, NextResponse } from "next/server";
import { prisma, withDatabaseRetry } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { getLocalizedProduct } from "@/lib/i18n-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "8"), 20);
    const locale = searchParams.get("locale") || "en";

    // Get popular products based on multiple factors:
    // 1. Recently viewed count (last 30 days)
    // 2. Cart additions (last 30 days)
    // 3. Order frequency (last 30 days)
    // 4. High rating products
    // 5. Recently added products with good reception

    const popularProducts = await withDatabaseRetry(async () => {
      // For now, we'll use a simpler approach since we don't have analytics tables yet
      // We'll prioritize: high-rated products, recently added, and with good stock
      const products = await prisma.product.findMany({
        where: {
          stock: { gt: 0 }, // In stock only
        },
        include: {
          translations: true,
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              cartItems: true,
              orderItems: true,
            },
          },
        },
        orderBy: [
          { createdAt: "desc" }, // Recent products first
          { stock: "desc" }, // High stock items
        ],
        take: limit * 2, // Get more to filter and sort
      });

      // Calculate popularity score for each product
      const productsWithScore = products.map((product) => {
        const avgRating = product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0;

        const cartCount = product._count.cartItems || 0;
        const orderCount = product._count.orderItems || 0;
        const reviewCount = product.reviews.length;

        // Calculate popularity score (weighted algorithm)
        const popularityScore =
          (avgRating * 0.3) +           // 30% rating weight
          (Math.min(cartCount / 10, 5) * 0.25) +    // 25% cart additions (capped at 5 points)
          (Math.min(orderCount / 5, 5) * 0.25) +    // 25% order frequency (capped at 5 points)
          (Math.min(reviewCount / 10, 2) * 0.1) +   // 10% review count (capped at 2 points)
          (product.stock > 50 ? 1 : 0.5) * 0.1;     // 10% stock bonus

        return {
          ...product,
          popularityScore,
          averageRating: avgRating,
        };
      });

      // Sort by popularity score and take the requested limit
      const sortedProducts = productsWithScore
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, limit);

      return sortedProducts;
    });

    // Localize products
    const localizedProducts = popularProducts.map((product) => {
      const localized = getLocalizedProduct(product, locale);
      return {
        ...localized,
        averageRating: product.averageRating,
        reviewCount: product.reviews.length,
        popularityScore: product.popularityScore,
      };
    });

    return successResponse({
      products: localizedProducts,
      meta: {
        count: localizedProducts.length,
        limit,
        locale,
        algorithm: "weighted_popularity_score",
      },
    });
  } catch (error) {
    console.error("Popular products API error:", error);
    return errorResponse("Failed to fetch popular products", 500);
  }
}