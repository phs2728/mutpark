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
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const providers = await prisma.shippingProvider.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        shipments: {
          select: {
            id: true,
            status: true,
          }
        }
      }
    });

    // Add tracking statistics
    const providersWithStats = providers.map(provider => ({
      ...provider,
      stats: {
        totalShipments: provider.shipments.length,
        delivered: provider.shipments.filter(t => t.status === "DELIVERED").length,
        inTransit: provider.shipments.filter(t => t.status === "IN_TRANSIT").length,
        failed: provider.shipments.filter(t => t.status === "FAILED").length,
      }
    }));

    return NextResponse.json({ providers: providersWithStats });

  } catch (error) {
    console.error("Shipping providers fetch error:", error);
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

    const {
      name,
      code,
      logo,
      website,
      apiEndpoint,
      apiKey,
      apiSecret,
      testMode,
      supportsCOD,
      supportsTracking,
      baseRate,
      weightRate,
    } = await request.json();

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingProvider = await prisma.shippingProvider.findUnique({
      where: { code }
    });

    if (existingProvider) {
      return NextResponse.json(
        { error: "Provider code already exists" },
        { status: 400 }
      );
    }

    const provider = await prisma.shippingProvider.create({
      data: {
        name,
        code: code.toUpperCase(),
        logo: logo || null,
        website: website || null,
        apiEndpoint: apiEndpoint || null,
        apiKey: apiKey || null,
        apiSecret: apiSecret || null,
        testMode: testMode !== false,
        supportsCOD: supportsCOD === true,
        supportsTracking: supportsTracking !== false,
        baseRate: baseRate || 10,
        weightRate: weightRate || null,
        status: "ACTIVE",
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "CREATE",
        entityType: "ShippingProvider",
        entityId: provider.id.toString(),
        oldValues: {},
        newValues: { name, code, status: provider.status },
        description: `Created shipping provider: ${name}`,
      },
    });

    return NextResponse.json({ success: true, provider });

  } catch (error) {
    console.error("Shipping provider creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}