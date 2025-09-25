import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderIds, status, trackingNumber, notes } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: "Order IDs are required" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // 선택된 주문들의 현재 상태 확인
    const currentOrders = await prisma.order.findMany({
      where: {
        id: { in: orderIds }
      },
      select: {
        id: true,
        status: true,
        orderNumber: true
      }
    });

    if (currentOrders.length !== orderIds.length) {
      return NextResponse.json(
        { error: "Some orders not found" },
        { status: 404 }
      );
    }

    // 일괄 업데이트 실행
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedOrders = await prisma.order.updateMany({
      where: {
        id: { in: orderIds }
      },
      data: updateData
    });

    // 각 주문에 대해 감사 로그 기록
    const auditLogs = currentOrders.map(order => ({
      userId: authResult.user.userId,
      action: "UPDATE" as const,
      entityType: "Order",
      entityId: order.id.toString(),
      oldValues: { status: order.status },
      newValues: { status },
      description: `Bulk update: Order ${order.orderNumber} status changed from ${order.status} to ${status}`
    }));

    await prisma.auditLog.createMany({
      data: auditLogs
    });

    return NextResponse.json({
      success: true,
      updatedCount: updatedOrders.count,
      message: `${updatedOrders.count}개 주문이 성공적으로 업데이트되었습니다.`
    });

  } catch (error) {
    console.error("Admin bulk order update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}