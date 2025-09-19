import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";
import { fetchTrackingStatus } from "@/lib/tracking";

interface RouteParams {
  id: string;
}

export async function GET(request: NextRequest, context: { params: Promise<RouteParams> }) {
  try {
    const user = requireAuth(request);
    const { id } = await context.params;
    const orderId = Number(id);
    if (!Number.isFinite(orderId)) {
      return errorResponse("Invalid order id", 400);
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.userId },
      select: {
        id: true,
        trackingNumber: true,
        trackingCarrier: true,
        trackingStatus: true,
      },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    if (!order.trackingNumber) {
      return errorResponse("Tracking not available", 404);
    }

    const tracking = await fetchTrackingStatus(order.trackingNumber, order.trackingCarrier ?? undefined);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        trackingStatus: tracking.status,
        trackingUpdatedAt: new Date(),
      },
    });

    return successResponse({
      orderId: order.id,
      tracking,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error(error);
    return errorResponse("Unable to load tracking", 500);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<RouteParams> }) {
  try {
    requireAuth(request, { adminOnly: true });
    const { id } = await context.params;
    const orderId = Number(id);
    if (!Number.isFinite(orderId)) {
      return errorResponse("Invalid order id", 400);
    }

    const body = (await request.json()) as {
      trackingNumber?: string;
      carrier?: string;
    };

    if (!body.trackingNumber) {
      return errorResponse("trackingNumber is required", 400);
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: body.trackingNumber,
        trackingCarrier: body.carrier,
        trackingStatus: "CREATED",
        trackingUpdatedAt: new Date(),
      },
      select: {
        id: true,
        trackingNumber: true,
        trackingCarrier: true,
        trackingStatus: true,
      },
    });

    return successResponse({ order });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return errorResponse("Admin privileges required", 403);
    }
    console.error(error);
    return errorResponse("Unable to update tracking", 500);
  }
}
