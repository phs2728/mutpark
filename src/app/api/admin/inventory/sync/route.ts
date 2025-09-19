import { NextRequest } from "next/server";
import { addDays, differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { errorResponse, successResponse } from "@/lib/api";

const EXPIRING_WINDOW_DAYS = 7;

export async function POST(request: NextRequest) {
  try {
    requireAuth(request, { adminOnly: true });

    const now = new Date();
    const expiringCutoff = addDays(now, EXPIRING_WINDOW_DAYS);

    const [expired, expiring, fresh] = await prisma.$transaction([
      prisma.product.updateMany({
        where: {
          expiryDate: {
            not: null,
            lt: now,
          },
        },
        data: {
          freshnessStatus: "EXPIRED",
        },
      }),
      prisma.product.updateMany({
        where: {
          expiryDate: {
            not: null,
            gte: now,
            lte: expiringCutoff,
          },
        },
        data: {
          freshnessStatus: "EXPIRING",
        },
      }),
      prisma.product.updateMany({
        where: {
          OR: [
            { expiryDate: null },
            {
              expiryDate: {
                gt: expiringCutoff,
              },
            },
          ],
        },
        data: {
          freshnessStatus: "FRESH",
        },
      }),
    ]);

    return successResponse({
      updated: {
        expired: expired.count,
        expiring: expiring.count,
        fresh: fresh.count,
      },
      timestamp: now.toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Admin privileges required", 403);
    }
    console.error(error);
    return errorResponse("Unable to run inventory sync", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    requireAuth(request, { adminOnly: true });

    const now = new Date();
    const products = await prisma.product.findMany({
      select: {
        id: true,
        baseName: true,
        freshnessStatus: true,
        expiryDate: true,
        stock: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    const enriched = products.map((product) => ({
      ...product,
      daysToExpiry: product.expiryDate ? differenceInCalendarDays(product.expiryDate, now) : null,
    }));

    return successResponse({ products: enriched });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Admin privileges required", 403);
    }
    console.error(error);
    return errorResponse("Unable to load inventory", 500);
  }
}
