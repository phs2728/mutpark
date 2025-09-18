import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";

interface RouteContext {
  params: { slug: string };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: context.params.slug },
      include: {
        translations: true,
      },
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse(product);
  } catch (error) {
    console.error(error);
    return errorResponse("Unable to load product", 500);
  }
}
