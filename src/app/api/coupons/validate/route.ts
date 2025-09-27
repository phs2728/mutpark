import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { code, cartItems, userId, email } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required" },
        { status: 400 }
      );
    }

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code },
      include: {
        usages: {
          where: userId ? { userId } : { email },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "This coupon is no longer active" },
        { status: 400 }
      );
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json(
        { error: "This coupon has expired or is not yet valid" },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "This coupon has reached its usage limit" },
        { status: 400 }
      );
    }

    // Check user usage limit
    if (coupon.userUsageLimit && coupon.usages.length >= coupon.userUsageLimit) {
      return NextResponse.json(
        { error: "You have already used this coupon the maximum number of times" },
        { status: 400 }
      );
    }

    // Check first-time customer requirement
    if (coupon.firstTimeCustomerOnly && userId) {
      const orderCount = await prisma.order.count({
        where: { userId },
      });

      if (orderCount > 0) {
        return NextResponse.json(
          { error: "This coupon is only valid for first-time customers" },
          { status: 400 }
        );
      }
    }

    // Calculate cart totals
    const cartSubtotal = cartItems.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Check minimum order amount
    if (coupon.minimumOrderAmount && cartSubtotal < Number(coupon.minimumOrderAmount)) {
      return NextResponse.json(
        {
          error: `Minimum order amount of ${coupon.minimumOrderAmount} ${coupon.currency} is required`,
          minimumAmount: Number(coupon.minimumOrderAmount)
        },
        { status: 400 }
      );
    }

    // Filter applicable products
    const applicableProducts = cartItems.filter((item: any) => {
      // Check if product is included
      if (coupon.applicableToProducts) {
        const applicableProductIds = coupon.applicableToProducts as number[];
        if (applicableProductIds.length > 0 && !applicableProductIds.includes(item.productId)) {
          return false;
        }
      }

      // Check if product category is included
      if (coupon.applicableToCategories) {
        const applicableCategories = coupon.applicableToCategories as string[];
        if (applicableCategories.length > 0 && !applicableCategories.includes(item.category)) {
          return false;
        }
      }

      // Check if product brand is included
      if (coupon.applicableToBrands) {
        const applicableBrands = coupon.applicableToBrands as string[];
        if (applicableBrands.length > 0 && !applicableBrands.includes(item.brand)) {
          return false;
        }
      }

      // Check if product is excluded
      if (coupon.excludedProducts) {
        const excludedProductIds = coupon.excludedProducts as number[];
        if (excludedProductIds.includes(item.productId)) {
          return false;
        }
      }

      // Check if product category is excluded
      if (coupon.excludedCategories) {
        const excludedCategories = coupon.excludedCategories as string[];
        if (excludedCategories.includes(item.category)) {
          return false;
        }
      }

      // Check if product brand is excluded
      if (coupon.excludedBrands) {
        const excludedBrands = coupon.excludedBrands as string[];
        if (excludedBrands.includes(item.brand)) {
          return false;
        }
      }

      return true;
    });

    // Calculate discount
    let discountAmount = 0;
    let freeShipping = false;

    if (coupon.type === "FREE_SHIPPING") {
      freeShipping = true;
    } else if (applicableProducts.length > 0) {
      const applicableSubtotal = applicableProducts.reduce((total: number, item: any) => {
        return total + (item.price * item.quantity);
      }, 0);

      if (coupon.type === "PERCENTAGE") {
        discountAmount = (applicableSubtotal * Number(coupon.value)) / 100;
      } else if (coupon.type === "FIXED_AMOUNT") {
        discountAmount = Math.min(Number(coupon.value), applicableSubtotal);
      }

      // Apply max discount limit
      if (coupon.maxDiscountAmount && discountAmount > Number(coupon.maxDiscountAmount)) {
        discountAmount = Number(coupon.maxDiscountAmount);
      }
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
      },
      discount: {
        amount: discountAmount,
        freeShipping,
        applicableProducts: applicableProducts.length,
        totalApplicableAmount: applicableProducts.reduce((total: number, item: any) => {
          return total + (item.price * item.quantity);
        }, 0),
      },
    });

  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}