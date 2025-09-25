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

    const resolvedParams = await params;
    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(resolvedParams.id) }
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ banner });

  } catch (error) {
    console.error("Banner fetch error:", error);
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

    const resolvedParams = await params;
    const bannerId = parseInt(resolvedParams.id);

    const existingBanner = await prisma.banner.findUnique({
      where: { id: bannerId }
    });

    if (!existingBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
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
      status
    } = await request.json();

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (position !== undefined) updateData.position = position;
    if (priority !== undefined) updateData.priority = priority;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (status !== undefined) updateData.status = status;

    const updatedBanner = await prisma.banner.update({
      where: { id: bannerId },
      data: updateData
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "UPDATE",
        entityType: "Banner",
        entityId: bannerId.toString(),
        oldValues: {
          title: existingBanner.title,
          position: existingBanner.position,
          status: existingBanner.status
        },
        newValues: {
          title: updatedBanner.title,
          position: updatedBanner.position,
          status: updatedBanner.status
        },
        description: `Updated banner: ${updatedBanner.title}`
      }
    });

    return NextResponse.json({ success: true, banner: updatedBanner });

  } catch (error) {
    console.error("Banner update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const bannerId = parseInt(resolvedParams.id);

    const existingBanner = await prisma.banner.findUnique({
      where: { id: bannerId }
    });

    if (!existingBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
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
      status
    } = await request.json();

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (position !== undefined) updateData.position = position;
    if (priority !== undefined) updateData.priority = priority;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (status !== undefined) updateData.status = status;

    const updatedBanner = await prisma.banner.update({
      where: { id: bannerId },
      data: updateData
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "UPDATE",
        entityType: "Banner",
        entityId: bannerId.toString(),
        oldValues: {
          title: existingBanner.title,
          position: existingBanner.position,
          status: existingBanner.status
        },
        newValues: {
          title: updatedBanner.title,
          position: updatedBanner.position,
          status: updatedBanner.status
        },
        description: `Updated banner: ${updatedBanner.title}`
      }
    });

    return NextResponse.json({ success: true, banner: updatedBanner });

  } catch (error) {
    console.error("Banner update error:", error);
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

    const resolvedParams = await params;
    const bannerId = parseInt(resolvedParams.id);

    const existingBanner = await prisma.banner.findUnique({
      where: { id: bannerId }
    });

    if (!existingBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    await prisma.banner.delete({
      where: { id: bannerId }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "DELETE",
        entityType: "Banner",
        entityId: bannerId.toString(),
        oldValues: {
          title: existingBanner.title,
          position: existingBanner.position
        },
        newValues: {},
        description: `Deleted banner: ${existingBanner.title}`
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Banner deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}