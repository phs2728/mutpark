import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";
import { updateProfileSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const [profile, cartCount, pendingOrders] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          locale: true,
          currency: true,
          createdAt: true,
        },
      }),
      prisma.cartItem.count({ where: { userId: user.userId } }),
      prisma.order.count({
        where: { userId: user.userId, status: { in: ["PENDING", "AWAITING_PAYMENT", "PROCESSING"] } },
      }),
    ]);

    return successResponse({ profile, stats: { cartCount, pendingOrders } });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error(error);
    return errorResponse("Unable to load profile", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: user.userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        locale: true,
        currency: true,
      },
    });

    return successResponse(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    if (error instanceof Error && (error as { issues?: unknown }).issues) {
      return errorResponse("Invalid request payload", 400);
    }
    console.error(error);
    return errorResponse("Unable to update profile", 500);
  }
}
