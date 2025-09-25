import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = parseInt(params.id);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                baseName: true,
                imageUrl: true,
                sku: true,
                translations: true
              }
            }
          }
        },
        payment: true,
        taxInvoice: true,
        shippingTracking: {
          include: {
            provider: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });

  } catch (error) {
    console.error("Admin order detail fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = parseInt(params.id);
    const updates = await request.json();

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...updates,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { baseName: true }
            }
          }
        }
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "UPDATE",
        entityType: "Order",
        entityId: orderId.toString(),
        oldValues: currentOrder,
        newValues: updates,
        description: `Order ${orderId} updated`
      }
    });

    return NextResponse.json({ order: updatedOrder });

  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = parseInt(params.id);

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await prisma.order.delete({
      where: { id: orderId }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "DELETE",
        entityType: "Order",
        entityId: orderId.toString(),
        oldValues: order,
        description: `Order ${orderId} deleted`
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Admin order delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}