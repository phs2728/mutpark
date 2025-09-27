import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const now = new Date();

    // Get public active coupons that are currently valid
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        isPublic: true,
        validFrom: {
          lte: now,
        },
        validUntil: {
          gte: now,
        },
        OR: [
          { usageLimit: null },
          {
            AND: [
              { usageLimit: { not: null } },
              { usageCount: { lt: prisma.coupon.fields.usageLimit } },
            ],
          },
        ],
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        type: true,
        value: true,
        minimumOrderAmount: true,
        maxDiscountAmount: true,
        currency: true,
        validUntil: true,
        usageLimit: true,
        usageCount: true,
        firstTimeCustomerOnly: true,
      },
      orderBy: [
        { validUntil: "asc" },
        { createdAt: "desc" },
      ],
    });

    // Format coupons for public display
    const formattedCoupons = coupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: Number(coupon.value),
      minimumOrderAmount: coupon.minimumOrderAmount ? Number(coupon.minimumOrderAmount) : null,
      maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
      currency: coupon.currency,
      validUntil: coupon.validUntil.toISOString(),
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
      usageRemaining: coupon.usageLimit ? coupon.usageLimit - coupon.usageCount : null,
      firstTimeCustomerOnly: coupon.firstTimeCustomerOnly,
    }));

    return NextResponse.json({
      coupons: formattedCoupons,
    });

  } catch (error) {
    console.error("Public coupons fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}