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

    const productId = parseInt(params.id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        translations: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 5
        },
        orderItems: {
          include: {
            order: {
              select: { orderNumber: true, createdAt: true, status: true }
            }
          },
          orderBy: { order: { createdAt: "desc" } },
          take: 10
        },
        _count: {
          select: {
            orderItems: true,
            reviews: true,
            cartItems: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productWithStats = {
      ...product,
      totalSales: product._count.orderItems,
      reviewCount: product._count.reviews,
      cartCount: product._count.cartItems,
      stockStatus: product.stock === 0 ? "OUT_OF_STOCK" :
                   product.stock <= 10 ? "LOW_STOCK" : "IN_STOCK",
      freshnessStatus: product.expiryDate && new Date(product.expiryDate) < new Date()
                      ? "EXPIRED" : product.freshnessStatus,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0
    };

    return NextResponse.json({ product: productWithStats });

  } catch (error) {
    console.error("Admin product detail fetch error:", error);
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

    const productId = parseInt(params.id);
    const updateData = await request.json();
    const { translations, ...baseUpdate } = updateData;

    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { translations: true }
    });

    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...baseUpdate,
        updatedAt: new Date()
      },
      include: {
        translations: true
      }
    });

    // Update translations if provided
    if (translations) {
      // Delete existing translations
      await prisma.productTranslation.deleteMany({
        where: { productId }
      });

      // Create new translations
      await prisma.productTranslation.createMany({
        data: translations.map((t: any) => ({
          ...t,
          productId
        }))
      });
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "UPDATE",
        entityType: "Product",
        entityId: productId.toString(),
        oldValues: currentProduct,
        newValues: updateData,
        description: `Product updated: ${updatedProduct.baseName}`
      }
    });

    return NextResponse.json({ product: updatedProduct });

  } catch (error) {
    console.error("Admin product update error:", error);
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

    const productId = parseInt(params.id);

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product has orders
    const orderCount = await prisma.orderItem.count({
      where: { productId }
    });

    if (orderCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete product with existing orders" },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id: productId }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "DELETE",
        entityType: "Product",
        entityId: productId.toString(),
        oldValues: product,
        description: `Product deleted: ${product.baseName}`
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Admin product delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}