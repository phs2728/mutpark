import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";

interface IyzicoWebhookPayload {
  transactionId: string;
  status: "success" | "failure";
  orderNumber: string;
  rawPayload?: unknown;
  [key: string]: string | number | boolean | unknown;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as IyzicoWebhookPayload;

    if (!payload.transactionId || !payload.orderNumber) {
      return errorResponse("Invalid webhook payload", 400);
    }

    const payment = await prisma.payment.findFirst({
      where: { transactionId: payload.transactionId },
      include: { order: true },
    });

    if (!payment) {
      await prisma.webhookEvent.create({
        data: {
          provider: "iyzico",
          eventType: payload.status,
          payload,
          status: "unknown_payment",
        },
      });
      return errorResponse("Payment not found", 404);
    }

    const status = payload.status === "success" ? "SUCCEEDED" : "FAILED";

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status,
          rawResponse: payload,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: status === "SUCCEEDED" ? "PAID" : "PENDING",
        },
      });

      await tx.webhookEvent.create({
        data: {
          provider: "iyzico",
          eventType: payload.status,
          payload,
          status: "processed",
        },
      });
    });

    return successResponse({ received: true });
  } catch (error) {
    console.error(error);
    return errorResponse("Unable to process webhook", 500);
  }
}
