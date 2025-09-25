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
    const position = searchParams.get("position");
    const status = searchParams.get("status");

    const where: any = {};
    if (position) where.position = position;
    if (status) where.status = status;

    const banners = await prisma.banner.findMany({
      where,
      orderBy: [
        { priority: "asc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json({ banners });

  } catch (error) {
    console.error("Banner fetch error:", error);
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
      title,
      description,
      imageUrl,
      linkUrl,
      position,
      priority,
      startDate,
      endDate,
      status,
      deviceType,
      locale
    } = await request.json();

    if (!title || !imageUrl || !position) {
      return NextResponse.json(
        { error: "Title, image, and position are required" },
        { status: 400 }
      );
    }

    // Get the next priority number for this position if not provided
    let finalPriority = priority;
    if (!finalPriority) {
      const lastBanner = await prisma.banner.findFirst({
        where: { position },
        orderBy: { priority: "desc" }
      });
      finalPriority = (lastBanner?.priority || 0) + 1;
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        description: description || null,
        imageUrl,
        linkUrl: linkUrl || null,
        position,
        priority: finalPriority,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        status: status || "DRAFT",
        deviceType: deviceType || "all",
        locale: locale || "tr",
        viewCount: 0,
        clickCount: 0,
        createdBy: authResult.user.userId
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "CREATE",
        entityType: "Banner",
        entityId: banner.id.toString(),
        oldValues: {},
        newValues: { title, position, status: banner.status },
        description: `Created banner: ${title}`
      }
    });

    return NextResponse.json({ success: true, banner });

  } catch (error) {
    console.error("Banner creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}