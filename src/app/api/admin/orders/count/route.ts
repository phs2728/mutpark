import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 실제 데이터베이스에서 주문 수 조회
    const pendingOrders = await prisma.order.count({
      where: {
        status: {
          in: ['PENDING', 'AWAITING_PAYMENT']
        }
      }
    });

    const totalOrders = await prisma.order.count();

    return NextResponse.json({
      success: true,
      pendingOrders,
      totalOrders
    });

  } catch (error) {
    console.error('Order count API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order count' },
      { status: 500 }
    );
  }
}