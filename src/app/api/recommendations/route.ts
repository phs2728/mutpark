import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/session";

// Simple collaborative filtering recommendation algorithm
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const user = await getAuthenticatedUser();

    if (!user?.userId) {
      // Return popular products for anonymous users
      const popularProducts = await prisma.product.findMany({
        where: {
          stock: { gt: 0 },
          freshnessStatus: { not: "EXPIRED" },
        },
        include: {
          translations: true,
          reviews: {
            select: {
              rating: true,
            },
          },
          orderItems: {
            select: {
              quantity: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });

      return NextResponse.json({
        products: popularProducts.map(product => ({
          ...product,
          averageRating: product.reviews.length > 0
            ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
            : 0,
          totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
          recommendationReason: "인기 상품",
        })),
        type: "popular",
      });
    }

    // Get user's purchase history
    const userOrders = await prisma.order.findMany({
      where: {
        userId: user.userId,
        status: "DELIVERED",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Last 50 orders
    });

    const purchasedProductIds = new Set(
      userOrders.flatMap(order => order.items.map(item => item.productId))
    );

    const purchasedCategories = new Set(
      userOrders.flatMap(order =>
        order.items
          .filter(item => item.product.category)
          .map(item => item.product.category!)
      )
    );

    // Get user's liked recipes to understand food preferences
    const likedRecipes = await prisma.recipeLike.findMany({
      where: { userId: user.userId },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      take: 20,
    });

    const recipeBasedProductIds = new Set(
      likedRecipes.flatMap(like =>
        like.recipe.ingredients
          .filter(ingredient => ingredient.product)
          .map(ingredient => ingredient.product!.id)
      )
    );

    // Find similar users based on purchase history
    const similarUsers = await prisma.order.findMany({
      where: {
        status: "DELIVERED",
        userId: { not: user.userId },
        items: {
          some: {
            productId: { in: Array.from(purchasedProductIds) },
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      distinct: ["userId"],
      take: 10,
    });

    const collaborativeProductIds = new Set(
      similarUsers.flatMap(order =>
        order.items
          .filter(item => !purchasedProductIds.has(item.productId))
          .map(item => item.productId)
      )
    );

    // Get recommendations based on different strategies
    const [
      categoryBasedProducts,
      collaborativeProducts,
      recipeBasedProducts,
      trendingProducts,
    ] = await Promise.all([
      // Category-based recommendations
      prisma.product.findMany({
        where: {
          category: { in: Array.from(purchasedCategories) },
          id: { notIn: Array.from(purchasedProductIds) },
          stock: { gt: 0 },
          freshnessStatus: { not: "EXPIRED" },
        },
        include: {
          translations: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: Math.ceil(limit * 0.4),
      }),

      // Collaborative filtering recommendations
      prisma.product.findMany({
        where: {
          id: { in: Array.from(collaborativeProductIds) },
          stock: { gt: 0 },
          freshnessStatus: { not: "EXPIRED" },
        },
        include: {
          translations: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        take: Math.ceil(limit * 0.3),
      }),

      // Recipe-based recommendations
      prisma.product.findMany({
        where: {
          id: {
            in: Array.from(recipeBasedProductIds),
            notIn: Array.from(purchasedProductIds)
          },
          stock: { gt: 0 },
          freshnessStatus: { not: "EXPIRED" },
        },
        include: {
          translations: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        take: Math.ceil(limit * 0.2),
      }),

      // Trending products (high rating, recent orders)
      prisma.product.findMany({
        where: {
          id: { notIn: Array.from(purchasedProductIds) },
          stock: { gt: 0 },
          freshnessStatus: { not: "EXPIRED" },
          reviews: {
            some: {
              rating: { gte: 4 },
            },
          },
        },
        include: {
          translations: true,
          reviews: {
            select: {
              rating: true,
            },
          },
          orderItems: {
            where: {
              order: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
              },
            },
            select: {
              quantity: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: Math.ceil(limit * 0.1),
      }),
    ]);

    // Combine and score recommendations
    const recommendations = [
      ...categoryBasedProducts.map(product => ({
        ...product,
        averageRating: product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0,
        recommendationReason: "비슷한 카테고리",
        score: 0.4,
      })),
      ...collaborativeProducts.map(product => ({
        ...product,
        averageRating: product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0,
        recommendationReason: "비슷한 취향의 고객이 구매",
        score: 0.3,
      })),
      ...recipeBasedProducts.map(product => ({
        ...product,
        averageRating: product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0,
        recommendationReason: "좋아하는 레시피 재료",
        score: 0.2,
      })),
      ...trendingProducts.map(product => ({
        ...product,
        averageRating: product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0,
        recentOrders: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
        recommendationReason: "인기 급상승",
        score: 0.1,
      })),
    ];

    // Remove duplicates and sort by score
    const uniqueRecommendations = recommendations
      .filter((product, index, self) =>
        index === self.findIndex(p => p.id === product.id)
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return NextResponse.json({
      products: uniqueRecommendations,
      type: "personalized",
      strategies: {
        categoryBased: categoryBasedProducts.length,
        collaborative: collaborativeProducts.length,
        recipeBased: recipeBasedProducts.length,
        trending: trendingProducts.length,
      },
    });
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}