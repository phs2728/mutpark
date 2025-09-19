import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";
import { updateProductReviewSchema } from "@/lib/validators";

interface RouteContext {
  params: Promise<{ id: string; reviewId: string }>;
}

function parseId(id: string, errorCode: string) {
  const parsed = Number(id);
  if (Number.isNaN(parsed)) {
    throw new Error(errorCode);
  }
  return parsed;
}

function serializeImageUrls(value: Prisma.JsonValue | null): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = requireAuth(request);
    const { id, reviewId } = await context.params;
    const productId = parseId(id, "INVALID_PRODUCT_ID");
    const reviewPrimaryId = parseId(reviewId, "INVALID_REVIEW_ID");

    const existing = await prisma.productReview.findUnique({
      where: { id: reviewPrimaryId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    if (!existing || existing.productId !== productId) {
      return errorResponse("Review not found", 404);
    }

    if (existing.userId !== user.userId && user.role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const data = updateProductReviewSchema.parse(body);

    const updateData: Prisma.ProductReviewUpdateInput = {
      status: "PUBLISHED",
      moderatedAt: null,
      moderatorNotes: null,
    };

    if (data.rating !== undefined) {
      updateData.rating = data.rating;
    }
    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.content !== undefined) {
      updateData.content = data.content;
    }
    if (data.imageUrls !== undefined) {
      updateData.imageUrls = data.imageUrls;
    }

    const updated = await prisma.productReview.update({
      where: { id: reviewPrimaryId },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return successResponse({
      id: updated.id,
      rating: updated.rating,
      title: updated.title,
      content: updated.content,
      imageUrls: serializeImageUrls(updated.imageUrls),
      helpfulCount: updated.helpfulCount,
      verifiedPurchase: updated.verifiedPurchase,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      author: {
        id: updated.user.id,
        name: updated.user.name,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_PRODUCT_ID") {
      return errorResponse("Invalid product id", 400);
    }
    if (error instanceof Error && error.message === "INVALID_REVIEW_ID") {
      return errorResponse("Invalid review id", 400);
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Forbidden", 403);
    }
    if (error instanceof Error && (error as { issues?: unknown }).issues) {
      return errorResponse("Invalid review payload", 400);
    }
    console.error(error);
    return errorResponse("Unable to update review", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = requireAuth(request);
    const { id, reviewId } = await context.params;
    const productId = parseId(id, "INVALID_PRODUCT_ID");
    const reviewPrimaryId = parseId(reviewId, "INVALID_REVIEW_ID");

    const existing = await prisma.productReview.findUnique({
      where: { id: reviewPrimaryId },
    });

    if (!existing || existing.productId !== productId) {
      return errorResponse("Review not found", 404);
    }

    if (existing.userId !== user.userId && user.role !== "ADMIN") {
      return errorResponse("Forbidden", 403);
    }

    await prisma.productReview.delete({ where: { id: reviewPrimaryId } });

    return successResponse({ message: "Review deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_PRODUCT_ID") {
      return errorResponse("Invalid product id", 400);
    }
    if (error instanceof Error && error.message === "INVALID_REVIEW_ID") {
      return errorResponse("Invalid review id", 400);
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Forbidden", 403);
    }
    console.error(error);
    return errorResponse("Unable to delete review", 500);
  }
}
