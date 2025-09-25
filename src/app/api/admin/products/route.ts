import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const stockFilter = searchParams.get("stockFilter");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { baseName: { contains: search } },
        { sku: { contains: search } },
        { brand: { contains: search } },
        { translations: { some: { name: { contains: search } } } }
      ];
    }

    if (stockFilter) {
      switch (stockFilter) {
        case "OUT_OF_STOCK":
          where.stock = 0;
          break;
        case "LOW_STOCK":
          where.stock = { lte: 10, gt: 0 };
          break;
        case "IN_STOCK":
          where.stock = { gt: 10 };
          break;
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          translations: true,
          _count: {
            select: {
              orderItems: true,
              reviews: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    const productsWithStats = products.map(product => ({
      ...product,
      totalSales: product._count.orderItems,
      reviewCount: product._count.reviews,
      stockStatus: product.stock === 0 ? "OUT_OF_STOCK" :
                   product.stock <= 10 ? "LOW_STOCK" : "IN_STOCK",
      freshnessStatus: product.expiryDate && new Date(product.expiryDate) < new Date()
                      ? "EXPIRED" : product.freshnessStatus
    }));

    return NextResponse.json({
      products: productsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Admin products fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productData = await request.json();
    const { translations, ...baseProduct } = productData;

    const product = await prisma.product.create({
      data: {
        ...baseProduct,
        translations: {
          create: translations || []
        }
      },
      include: {
        translations: true
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "CREATE",
        entityType: "Product",
        entityId: product.id.toString(),
        newValues: productData,
        description: `Product created: ${product.baseName}`
      }
    });

    return NextResponse.json({ product }, { status: 201 });

  } catch (error) {
    console.error("Admin product creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}