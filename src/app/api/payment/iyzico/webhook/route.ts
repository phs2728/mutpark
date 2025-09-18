import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";

interface IyzicoWebhookPayload extends Record<string, Prisma.JsonValue | undefined> {
  transactionId: string;
  status: "success" | "failure";
  orderNumber: string;
  rawPayload?: Prisma.JsonValue;
}

function isIyzicoWebhookPayload(value: unknown): value is IyzicoWebhookPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;
  return (
    typeof data.transactionId === "string" &&
    typeof data.orderNumber === "string" &&
    (data.status === "success" || data.status === "failure")
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawPayload = await request.json();
    if (!isIyzicoWebhookPayload(rawPayload)) {
      return errorResponse("Invalid webhook payload", 400);
    }

    const payload = rawPayload;

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
