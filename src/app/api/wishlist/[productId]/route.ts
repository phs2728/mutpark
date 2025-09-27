import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/session";

// POST /api/wishlist/[productId] - Add item to wishlist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const { productId: productIdStr } = await params;
    const productId = parseInt(productIdStr);

    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, message: "잘못된 상품 ID입니다" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "상품을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: auth.userId,
          productId: productId,
        },
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { success: false, message: "이미 위시리스트에 있는 상품입니다" },
        { status: 409 }
      );
    }

    // Add to wishlist
    await prisma.wishlistItem.create({
      data: {
        userId: auth.userId,
        productId: productId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "위시리스트에 추가되었습니다",
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "위시리스트 추가 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist/[productId] - Remove item from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const { productId: productIdStr } = await params;
    const productId = parseInt(productIdStr);

    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, message: "잘못된 상품 ID입니다" },
        { status: 400 }
      );
    }

    // Check if item exists in wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: auth.userId,
          productId: productId,
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, message: "위시리스트에서 상품을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // Remove from wishlist
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: auth.userId,
          productId: productId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "위시리스트에서 제거되었습니다",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "위시리스트 제거 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}