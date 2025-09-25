import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";
import { shippingService } from "@/lib/shipping-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingNumber: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackingNumber } = params;
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");

    // Get tracking information from shipping service
    const trackingInfo = await shippingService.trackPackage(
      trackingNumber,
      providerId ? parseInt(providerId) : undefined
    );

    if (!trackingInfo) {
      return NextResponse.json(
        { error: "Tracking information not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ trackingInfo });

  } catch (error) {
    console.error("Tracking lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { trackingNumber: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trackingNumber } = params;
    const { forceUpdate } = await request.json();

    // Find the shipping tracking record
    const tracking = await prisma.shippingTracking.findFirst({
      where: { trackingNumber },
      include: { order: true, provider: true }
    });

    if (!tracking) {
      return NextResponse.json(
        { error: "Tracking record not found" },
        { status: 404 }
      );
    }

    // Get updated tracking information
    const trackingInfo = await shippingService.trackPackage(
      trackingNumber,
      tracking.providerId
    );

    if (!trackingInfo) {
      return NextResponse.json(
        { error: "Unable to fetch updated tracking information" },
        { status: 500 }
      );
    }

    // Update the tracking record
    await shippingService.updateShippingTracking(tracking.orderId, trackingInfo);

    // If package is delivered, update order status
    if (trackingInfo.status === "DELIVERED") {
      await prisma.order.update({
        where: { id: tracking.orderId },
        data: { status: "DELIVERED" }
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "UPDATE",
        entityType: "ShippingTracking",
        entityId: tracking.id.toString(),
        oldValues: { status: tracking.status },
        newValues: { status: trackingInfo.status },
        description: `Updated tracking for ${trackingNumber}: ${tracking.status} → ${trackingInfo.status}`,
      },
    });

    return NextResponse.json({
      success: true,
      trackingInfo,
      message: "Tracking information updated successfully"
    });

  } catch (error) {
    console.error("Tracking update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}