import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { couponId, userId, orderId, email, discountAmount, orderAmount } = await request.json();

    if (!couponId || (!userId && !email) || !orderId || discountAmount === undefined || orderAmount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify coupon exists and is valid
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { error: "Invalid or inactive coupon" },
        { status: 400 }
      );
    }

    // Check if usage would exceed limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "Coupon usage limit exceeded" },
        { status: 400 }
      );
    }

    // Create coupon usage record and update usage count
    const result = await prisma.$transaction(async (tx) => {
      // Create usage record
      const usage = await tx.couponUsage.create({
        data: {
          couponId,
          userId,
          orderId,
          email,
          discountAmount,
          orderAmount,
        },
      });

      // Update coupon usage count
      await tx.coupon.update({
        where: { id: couponId },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });

      return usage;
    });

    return NextResponse.json({
      success: true,
      usage: result,
    });

  } catch (error) {
    console.error("Coupon application error:", error);
    return NextResponse.json(
      { error: "Failed to apply coupon" },
      { status: 500 }
    );
  }
}