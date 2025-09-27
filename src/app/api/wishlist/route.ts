import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/session";

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId: auth.userId,
      },
      include: {
        product: {
          include: {
            translations: true,
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: wishlistItems,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "위시리스트 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId || typeof productId !== "number") {
      return NextResponse.json(
        { success: false, message: "상품 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
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
        { success: false, message: "이미 위시리스트에 추가된 상품입니다" },
        { status: 409 }
      );
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: auth.userId,
        productId: productId,
      },
      include: {
        product: {
          include: {
            translations: true,
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: wishlistItem,
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