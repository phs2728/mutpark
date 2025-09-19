import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";
import { createOrderSchema } from "@/lib/validators";

const SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE_STANDARD = 29.9;
const SHIPPING_FEE_EXPRESS = 49.9;

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const orders = await prisma.order.findMany({
      where: { userId: user.userId },
      include: {
        items: true,
        payment: true,
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ orders });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error(error);
    return errorResponse("Unable to fetch orders", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    const address = await prisma.address.findUnique({
      where: { id: data.addressId },
    });

    if (!address || address.userId !== user.userId) {
      return errorResponse("Invalid address", 400);
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.userId },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      return errorResponse("Cart is empty", 400);
    }

    let subtotal = new Prisma.Decimal(0);
    const outOfStock: string[] = [];

    cartItems.forEach((item) => {
      if (!item.product || item.product.stock < item.quantity) {
        outOfStock.push(item.product?.baseName ?? `상품 ${item.productId}`);
      } else {
        subtotal = subtotal.add(item.product.price.mul(item.quantity));
      }
    });

    if (outOfStock.length > 0) {
      return errorResponse(`재고가 부족한 상품이 있습니다: ${outOfStock.join(", ")}`, 400);
    }

    const freeShipping = subtotal.gte(SHIPPING_THRESHOLD);
    const shippingFeeValue = freeShipping
      ? 0
      : data.shippingMethod === "express"
      ? SHIPPING_FEE_EXPRESS
      : SHIPPING_FEE_STANDARD;
    const shippingFee = new Prisma.Decimal(shippingFeeValue);
    const total = subtotal.add(shippingFee);

    const paymentMethod = data.paymentMethod ?? "iyzico";
    const paymentProvider = paymentMethod === "papara" ? "papara" : "iyzico";
    const installmentPlan = paymentMethod === "installment" ? data.installmentPlan ?? 3 : undefined;

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: user.userId,
          addressId: address.id,
          status: "AWAITING_PAYMENT",
          subtotalAmount: subtotal,
          shippingFee,
          totalAmount: total,
          shippingMethod: data.shippingMethod,
          notes: data.notes,
        },
      });

      await Promise.all(
        cartItems.map((item) =>
          tx.orderItem.create({
            data: {
              orderId: createdOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product!.price,
              currency: item.product!.currency,
              productName: item.product!.baseName,
              productImage: item.product!.imageUrl,
              metaSnapshot: {
                halalCertified: item.product!.halalCertified,
                spiceLevel: item.product!.spiceLevel,
              },
            },
          })
        )
      );

      await Promise.all(
        cartItems.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );

      await tx.cartItem.deleteMany({ where: { userId: user.userId } });

      await tx.payment.create({
        data: {
          orderId: createdOrder.id,
          status: "PENDING",
          provider: paymentProvider,
          amount: total,
          currency: createdOrder.currency,
          rawResponse:
            paymentMethod === "installment"
              ? {
                  paymentMethod,
                  installmentPlan,
                }
              : paymentMethod === "papara"
                ? {
                    paymentMethod,
                  }
                : {},
        },
      });

      return tx.order.findUniqueOrThrow({
        where: { id: createdOrder.id },
        include: {
          items: true,
          payment: true,
          address: true,
        },
      });
    });

    return successResponse(order, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    if (error instanceof Error && (error as { issues?: unknown }).issues) {
      return errorResponse("Invalid request payload", 400);
    }
    console.error(error);
    return errorResponse("Unable to create order", 500);
  }
}
