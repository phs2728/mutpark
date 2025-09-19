import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";
import {
  createProductReviewSchema,
  productReviewListSchema,
} from "@/lib/validators";

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

function serializeImageUrls(value: Prisma.JsonValue | null): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const productId = parseProductId(id);

    const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const filters = productReviewListSchema.parse(queryParams);
    const skip = (filters.page - 1) * filters.pageSize;

    const whereClause = {
      productId,
      status: "PUBLISHED" as const,
    };

    const [reviews, totalCount, aggregates, distribution] = await prisma.$transaction([
      prisma.productReview.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: filters.pageSize,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.productReview.count({ where: whereClause }),
      prisma.productReview.aggregate({
        where: whereClause,
        _avg: { rating: true },
      }),
      prisma.productReview.groupBy({
        where: whereClause,
        by: ["rating"],
        _count: true,
        orderBy: { rating: "asc" },
      }),
    ]);

    const ratings: Record<string, number> = {};
    distribution.forEach((item) => {
      ratings[item.rating.toString()] = typeof item._count === "number" ? item._count : 0;
    });

    const formatted = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      imageUrls: serializeImageUrls(review.imageUrls),
      helpfulCount: review.helpfulCount,
      verifiedPurchase: review.verifiedPurchase,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      author: {
        id: review.user.id,
        name: review.user.name,
      },
    }));

    return successResponse({
      reviews: formatted,
      page: filters.page,
      pageSize: filters.pageSize,
      total: totalCount,
      averageRating: aggregates._avg.rating ?? 0,
      ratingDistribution: {
        1: ratings["1"] ?? 0,
        2: ratings["2"] ?? 0,
        3: ratings["3"] ?? 0,
        4: ratings["4"] ?? 0,
        5: ratings["5"] ?? 0,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") {
      return errorResponse("Invalid product id", 400);
    }
    if (error instanceof Error && (error as { issues?: unknown }).issues) {
      return errorResponse("Invalid query parameters", 400);
    }
    console.error(error);
    return errorResponse("Unable to fetch product reviews", 500);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = requireAuth(request);
    const { id } = await context.params;
    const productId = parseProductId(id);

    const body = await request.json();
    const data = createProductReviewSchema.parse(body);

    const productExists = await prisma.product.findUnique({ where: { id: productId } });
    if (!productExists) {
      return errorResponse("Product not found", 404);
    }

    const qualifyingOrder = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: user.userId,
          status: {
            in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
          },
        },
      },
    });

    const review = await prisma.productReview.upsert({
      where: {
        productId_userId: {
          productId,
          userId: user.userId,
        },
      },
      update: {
        rating: data.rating,
        title: data.title,
        content: data.content,
        imageUrls: data.imageUrls,
        verifiedPurchase: Boolean(qualifyingOrder),
        status: "PUBLISHED",
        moderatedAt: null,
        moderatorNotes: null,
      },
      create: {
        productId,
        userId: user.userId,
        rating: data.rating,
        title: data.title,
        content: data.content,
        imageUrls: data.imageUrls,
        verifiedPurchase: Boolean(qualifyingOrder),
        status: "PUBLISHED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(
      {
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        imageUrls: serializeImageUrls(review.imageUrls),
        helpfulCount: review.helpfulCount,
        verifiedPurchase: review.verifiedPurchase,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        author: {
          id: review.user.id,
          name: review.user.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") {
      return errorResponse("Invalid product id", 400);
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Admin privileges required", 403);
    }
    if (error instanceof Error && (error as { issues?: unknown }).issues) {
      return errorResponse("Invalid review payload", 400);
    }
    console.error(error);
    return errorResponse("Unable to submit review", 500);
  }
}
