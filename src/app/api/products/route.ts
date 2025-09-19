import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";
import { productFilterSchema, createProductSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  try {
    const queryObject = Object.fromEntries(request.nextUrl.searchParams.entries());
    const filters = productFilterSchema.parse(queryObject);

    const where: Prisma.ProductWhereInput = {};

    if (filters.search) {
      where.OR = [
        { baseName: { contains: filters.search } },
        {
          translations: {
            some: {
              name: { contains: filters.search },
            },
          },
        },
      ];
    }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.brand) {
    where.brand = filters.brand;
  }

    if (filters.halal !== undefined) {
      where.halalCertified = filters.halal;
    }

    if (filters.spicy) {
      where.spiceLevel = { gt: 0 };
    }

    const skip = (filters.page - 1) * filters.pageSize;

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: filters.pageSize,
        include: {
          translations: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / filters.pageSize) || 1;

    return successResponse({
      items,
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Unable to load products", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAuth(request, { adminOnly: true });

    const body = await request.json();
    const data = createProductSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        slug: data.slug,
        baseName: data.baseName,
        baseDescription: data.baseDescription,
        price: new Prisma.Decimal(data.price),
        currency: data.currency,
        stock: data.stock,
        halalCertified: data.halalCertified,
        spiceLevel: data.spiceLevel ?? null,
        weightGrams: data.weightGrams ?? null,
        imageUrl: data.imageUrl ?? null,
        brand: data.brand ?? null,
        category: data.category ?? null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        translations: {
          create: data.translations.map((translation) => ({
            language: translation.language,
            name: translation.name,
            description: translation.description,
          })),
        },
      },
      include: {
        translations: true,
      },
    });

    return successResponse(product, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof Error && (error as { issues?: unknown }).issues) {
      return errorResponse("Invalid request payload", 400);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorResponse("Product with the same SKU or slug already exists", 409);
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Admin privileges required", 403);
    }
    return errorResponse("Unable to create product", 500);
  }
}
