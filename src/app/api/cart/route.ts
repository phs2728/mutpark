import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";
import { upsertCartSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const items = await prisma.cartItem.findMany({
      where: { userId: user.userId },
      include: {
        product: {
          include: {
            translations: true,
          },
        },
      },
    });

    return successResponse({ items });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error(error);
    return errorResponse("Unable to fetch cart", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const data = upsertCartSchema.parse(body);

    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) {
      return errorResponse("Product not found", 404);
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.userId,
          productId: data.productId,
        },
      },
    });

    const nextQuantity = (existing?.quantity ?? 0) + data.quantity;
    if (product.stock < nextQuantity) {
      return errorResponse("Insufficient stock", 400);
    }

    const item = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: user.userId,
          productId: data.productId,
        },
      },
      update: {
        quantity: nextQuantity,
      },
      create: {
        userId: user.userId,
        productId: data.productId,
        quantity: data.quantity,
      },
      include: {
        product: {
          include: { translations: true },
        },
      },
    });

    return successResponse(item, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    if (error instanceof Error && (error as { issues?: unknown }).issues) {
      return errorResponse("Invalid request payload", 400);
    }
    console.error(error);
    return errorResponse("Unable to update cart", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const data = upsertCartSchema.parse(body);

    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) {
      return errorResponse("Product not found", 404);
    }

    if (product.stock < data.quantity) {
      return errorResponse("Insufficient stock", 400);
    }

    const item = await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId: user.userId,
          productId: data.productId,
        },
      },
      data: {
        quantity: data.quantity,
      },
      include: {
        product: {
          include: { translations: true },
        },
      },
    });

    return successResponse(item);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    if (error instanceof Error && (error as { issues?: unknown }).issues) {
      return errorResponse("Invalid request payload", 400);
    }
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2025") {
      return errorResponse("Cart item not found", 404);
    }
    console.error(error);
    return errorResponse("Unable to update cart", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = (await request.json().catch(() => ({}))) as {
      productId?: number;
    };
    const productId = body.productId;

    if (!productId) {
      await prisma.cartItem.deleteMany({ where: { userId: user.userId } });
      return successResponse({ message: "Cart cleared" });
    }

    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId: user.userId,
          productId,
        },
      },
    });

    return successResponse({ message: "Item removed" });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2025") {
      return errorResponse("Cart item not found", 404);
    }
    console.error(error);
    return errorResponse("Unable to delete cart item", 500);
  }
}
