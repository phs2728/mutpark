import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";

const MAX_RESULTS = 8;

export async function GET(request: NextRequest) {
  try {
    const term = request.nextUrl.searchParams.get("q")?.trim();
    if (!term || term.length < 2) {
      return successResponse({ suggestions: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { baseName: { contains: term } },
          {
            translations: {
              some: {
                name: {
                  contains: term,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        slug: true,
        baseName: true,
        brand: true,
        category: true,
        price: true,
        currency: true,
        translations: {
          take: 1,
        },
      },
      take: MAX_RESULTS,
      orderBy: {
        createdAt: "desc",
      },
    });

    const suggestions = products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.translations[0]?.name ?? product.baseName,
      brand: product.brand,
      category: product.category,
      price: product.price,
      currency: product.currency,
    }));

    return successResponse({ suggestions });
  } catch (error) {
    console.error(error);
    return errorResponse("Unable to search products", 500);
  }
}
