import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";

interface PaparaCheckoutPayload {
  orderId: number;
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = (await request.json()) as PaparaCheckoutPayload;

    if (!body.orderId) {
      return errorResponse("orderId is required", 400);
    }

    const order = await prisma.order.findFirst({
      where: { id: body.orderId, userId: user.userId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    if (!order.payment || order.payment.provider !== "papara") {
      return errorResponse("Papara payment not initialized", 400);
    }

    const instructions = {
      explanation: "Transfer the total amount to the Papara account below.",
      payee: {
        name: "MutPark",
        paparaNumber: "1234567890",
      },
      amount: order.totalAmount.toNumber(),
      currency: order.currency,
      referenceCode: order.orderNumber,
      status: order.payment.status,
    };

    return successResponse({ orderId: order.id, instructions });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error(error);
    return errorResponse("Unable to prepare Papara checkout", 500);
  }
}
