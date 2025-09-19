import { NextRequest } from "next/server";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { errorResponse, successResponse } from "@/lib/api";

const DEFAULT_LOW_STOCK_THRESHOLD = 10;
const EXPIRY_WINDOW_DAYS = 7;

export async function GET(request: NextRequest) {
  try {
    requireAuth(request, { adminOnly: true });

    const now = new Date();
    const expiryCutoff = addDays(now, EXPIRY_WINDOW_DAYS);

    const [lowStock, expiringSoon] = await Promise.all([
      prisma.product.findMany({
        where: {
          stock: {
            lte: DEFAULT_LOW_STOCK_THRESHOLD,
          },
        },
        orderBy: { stock: "asc" },
        select: {
          id: true,
          sku: true,
          slug: true,
          baseName: true,
          stock: true,
          expiryDate: true,
          updatedAt: true,
        },
      }),
      prisma.product.findMany({
        where: {
          expiryDate: {
            not: null,
            lte: expiryCutoff,
            gt: now,
          },
        },
        orderBy: { expiryDate: "asc" },
        select: {
          id: true,
          sku: true,
          slug: true,
          baseName: true,
          stock: true,
          expiryDate: true,
        },
      }),
    ]);

    return successResponse({
      generatedAt: now.toISOString(),
      lowStock,
      expiringSoon,
      thresholds: {
        lowStock: DEFAULT_LOW_STOCK_THRESHOLD,
        expiryWindowDays: EXPIRY_WINDOW_DAYS,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Admin privileges required", 403);
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error(error);
    return errorResponse("Unable to load inventory status", 500);
  }
}
