import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";

export async function GET() {
  try {
    const [categories, brands] = await Promise.all([
      prisma.product.groupBy({
        by: ["category"],
        where: {
          category: {
            not: null,
          },
        },
      }),
      prisma.product.groupBy({
        by: ["brand"],
        where: {
          brand: {
            not: null,
          },
        },
      }),
    ]);

    const categoryValues = categories
      .map((item) => item.category)
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => a.localeCompare(b));

    const brandValues = brands
      .map((item) => item.brand)
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => a.localeCompare(b));

    return successResponse({ categories: categoryValues, brands: brandValues });
  } catch (error) {
    console.error(error);
    return errorResponse("Unable to load product filters", 500);
  }
}
