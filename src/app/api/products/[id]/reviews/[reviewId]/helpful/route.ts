import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";

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

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = requireAuth(request);
    const { id, reviewId } = await context.params;
    const productId = parseId(id, "INVALID_PRODUCT_ID");
    const reviewPrimaryId = parseId(reviewId, "INVALID_REVIEW_ID");

    // Verify review exists and belongs to the product
    const review = await prisma.productReview.findUnique({
      where: { id: reviewPrimaryId },
    });

    if (!review || review.productId !== productId) {
      return errorResponse("Review not found", 404);
    }

    // Check if user already marked this review as helpful
    const existingHelpful = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId: reviewPrimaryId,
          userId: user.userId,
        },
      },
    });

    if (existingHelpful) {
      return errorResponse("Already marked as helpful", 400);
    }

    // Create helpful record and update counter in transaction
    await prisma.$transaction(async (tx) => {
      await tx.reviewHelpful.create({
        data: {
          reviewId: reviewPrimaryId,
          userId: user.userId,
        },
      });

      await tx.productReview.update({
        where: { id: reviewPrimaryId },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
      });
    });

    return successResponse({ message: "Marked as helpful" });
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
      return errorResponse("Admin privileges required", 403);
    }
    console.error("Review helpful error:", error);
    return errorResponse("Unable to mark review as helpful", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = requireAuth(request);
    const { id, reviewId } = await context.params;
    const productId = parseId(id, "INVALID_PRODUCT_ID");
    const reviewPrimaryId = parseId(reviewId, "INVALID_REVIEW_ID");

    // Verify review exists and belongs to the product
    const review = await prisma.productReview.findUnique({
      where: { id: reviewPrimaryId },
    });

    if (!review || review.productId !== productId) {
      return errorResponse("Review not found", 404);
    }

    // Check if user has marked this review as helpful
    const existingHelpful = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId: reviewPrimaryId,
          userId: user.userId,
        },
      },
    });

    if (!existingHelpful) {
      return errorResponse("Not marked as helpful", 400);
    }

    // Remove helpful record and update counter in transaction
    await prisma.$transaction(async (tx) => {
      await tx.reviewHelpful.delete({
        where: {
          reviewId_userId: {
            reviewId: reviewPrimaryId,
            userId: user.userId,
          },
        },
      });

      await tx.productReview.update({
        where: { id: reviewPrimaryId },
        data: {
          helpfulCount: {
            decrement: 1,
          },
        },
      });
    });

    return successResponse({ message: "Removed helpful mark" });
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
      return errorResponse("Admin privileges required", 403);
    }
    console.error("Review helpful removal error:", error);
    return errorResponse("Unable to remove helpful mark", 500);
  }
}