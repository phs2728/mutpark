import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return errorResponse("잘못된 상품 ID입니다", 400);
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        stock: true,
        expiryDate: true,
        freshnessStatus: true,
        updatedAt: true,
      },
    });

    if (!product) {
      return errorResponse("상품을 찾을 수 없습니다", 404);
    }

    // 실시간 재고 상태 계산
    const now = new Date();
    const isExpired = product.expiryDate ? product.expiryDate < now : false;
    const isLowStock = product.stock < 5;

    let freshnessStatus = product.freshnessStatus;
    if (product.expiryDate) {
      const daysUntilExpiry = Math.ceil(
        (product.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry < 0) {
        freshnessStatus = "EXPIRED";
      } else if (daysUntilExpiry <= 3) {
        freshnessStatus = "EXPIRING";
      } else if (daysUntilExpiry <= 7) {
        freshnessStatus = "FRESH";
      } else {
        freshnessStatus = "VERY_FRESH";
      }
    }

    return successResponse({
      stock: product.stock,
      isExpired,
      isLowStock,
      freshnessStatus,
      lastUpdated: product.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("재고 정보 조회 오류:", error);
    return errorResponse("재고 정보를 가져오는 중 오류가 발생했습니다", 500);
  }
}