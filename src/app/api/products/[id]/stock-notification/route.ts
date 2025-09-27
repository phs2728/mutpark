import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const { email, productName } = await request.json();

    if (!email || !productName) {
      return NextResponse.json(
        { success: false, error: "Email and product name are required" },
        { status: 400 }
      );
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // 상품 존재 확인
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // 이미 등록된 알림이 있는지 확인
    const existingNotification = await prisma.stockNotification.findFirst({
      where: {
        productId,
        email,
        isActive: true
      }
    });

    if (existingNotification) {
      return NextResponse.json(
        { success: false, error: "You are already subscribed to notifications for this product" },
        { status: 409 }
      );
    }

    // 새 알림 등록
    const notification = await prisma.stockNotification.create({
      data: {
        productId,
        email,
        productName,
        isActive: true,
        createdAt: new Date()
      }
    });

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        id: notification.id,
        message: "Stock notification has been set successfully"
      }
    });

  } catch (error) {
    console.error("Stock notification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}