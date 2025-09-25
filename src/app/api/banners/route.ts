import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const status = searchParams.get("status") || "ACTIVE";
    const locale = searchParams.get("locale") || "tr";

    const where: any = {
      status: status as any,
      locale
    };

    if (position) {
      where.position = position;
    }

    // Only show banners that are currently active (within date range)
    const now = new Date();
    where.startDate = { lte: now };
    where.endDate = { gte: now };

    const banners = await prisma.banner.findMany({
      where,
      orderBy: [
        { priority: "asc" },
        { createdAt: "desc" }
      ],
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        linkUrl: true,
        position: true,
        status: true,
        startDate: true,
        endDate: true,
        deviceType: true,
        priority: true,
        viewCount: true,
        clickCount: true,
        locale: true
      }
    });

    const response = NextResponse.json({ banners });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;

  } catch (error) {
    console.error("Banner fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}