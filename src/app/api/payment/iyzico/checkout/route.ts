import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { errorResponse, successResponse } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const { orderId, returnUrl } = body as { orderId?: number; returnUrl?: string };

    if (!orderId) {
      return errorResponse("orderId is required", 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order || order.userId !== user.userId) {
      return errorResponse("Order not found", 404);
    }

    if (order.payment?.status === "SUCCEEDED") {
      return errorResponse("Order already paid", 400);
    }

    const checkoutToken = `iyz-${order.orderNumber}-${Date.now()}`;
    const redirectUrl = returnUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}/complete`;

    await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        status: "REQUIRES_ACTION",
        transactionId: checkoutToken,
      },
    });

    return successResponse({
      checkoutToken,
      redirectUrl,
      provider: "iyzico",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error(error);
    return errorResponse("Unable to create checkout session", 500);
  }
}
