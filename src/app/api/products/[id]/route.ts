import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";
import { updateProductSchema } from "@/lib/validators";

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
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        translations: true,
      },
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(product);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") {
      return errorResponse("Invalid product id", 400);
    }
    console.error(error);
    return errorResponse("Unable to load product", 500);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    requireAuth(request, { adminOnly: true });
    const { id } = await context.params;
    const productId = parseProductId(id);

    const body = await request.json();
    const data = updateProductSchema.parse(body);

    const updateData: Prisma.ProductUpdateInput = {};
    if (data.baseName !== undefined) updateData.baseName = data.baseName;
    if (data.baseDescription !== undefined) updateData.baseDescription = data.baseDescription;
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.halalCertified !== undefined) updateData.halalCertified = data.halalCertified;
    if (data.spiceLevel !== undefined) updateData.spiceLevel = data.spiceLevel;
    if (data.weightGrams !== undefined) updateData.weightGrams = data.weightGrams;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.expiryDate !== undefined) {
      updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
    }

    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: productId },
        data: updateData,
      });

      if (data.translations) {
        await Promise.all(
          data.translations.map((translation) =>
            tx.productTranslation.upsert({
              where: {
                productId_language: {
                  productId,
                  language: translation.language,
                },
              },
              update: {
                name: translation.name,
                description: translation.description,
              },
              create: {
                productId,
                language: translation.language,
                name: translation.name,
                description: translation.description,
              },
            })
          )
        );
      }

      return tx.product.findUnique({
        where: { id: updated.id },
        include: {
          translations: true,
        },
      });
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(product);
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return errorResponse("Product not found", 404);
    }
    if (error instanceof Error && (error as { issues?: unknown }).issues) {
      return errorResponse("Invalid request payload", 400);
    }
    console.error(error);
    return errorResponse("Unable to update product", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    requireAuth(request, { adminOnly: true });
    const { id } = await context.params;
    const productId = parseProductId(id);

    await prisma.product.delete({ where: { id: productId } });

    return successResponse({ message: "Product deleted" });
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return errorResponse("Product not found", 404);
    }
    console.error(error);
    return errorResponse("Unable to delete product", 500);
  }
}
