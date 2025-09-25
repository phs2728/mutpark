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
    const type = searchParams.get("type");

    const where: any = { isActive: true };
    if (type && type !== "ALL") {
      where.type = type;
    }

    const settings = await prisma.systemSettings.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        updater: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { type: "asc" },
        { key: "asc" }
      ]
    });

    // Group settings by type for easier frontend consumption
    const groupedSettings = settings.reduce((groups, setting) => {
      if (!groups[setting.type]) {
        groups[setting.type] = [];
      }
      groups[setting.type].push(setting);
      return groups;
    }, {} as Record<string, typeof settings>);

    return NextResponse.json({
      settings: groupedSettings,
      total: settings.length
    });

  } catch (error) {
    console.error("Admin settings fetch error:", error);
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

    const settingData = await request.json();

    const setting = await prisma.systemSettings.create({
      data: {
        ...settingData,
        createdBy: authResult.user.userId
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "CREATE",
        entityType: "SystemSettings",
        entityId: setting.id.toString(),
        newValues: settingData,
        description: `System setting created: ${setting.key}`
      }
    });

    return NextResponse.json({ setting }, { status: 201 });

  } catch (error) {
    console.error("Admin setting creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await request.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Expected array of setting updates" },
        { status: 400 }
      );
    }

    const updatedSettings = [];

    for (const update of updates) {
      const { id, ...updateData } = update;

      const currentSetting = await prisma.systemSettings.findUnique({
        where: { id }
      });

      if (!currentSetting) {
        continue; // Skip non-existent settings
      }

      const updatedSetting = await prisma.systemSettings.update({
        where: { id },
        data: {
          ...updateData,
          updatedBy: authResult.user.userId,
          updatedAt: new Date()
        }
      });

      updatedSettings.push(updatedSetting);

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          userId: authResult.user.userId,
          action: "UPDATE",
          entityType: "SystemSettings",
          entityId: id.toString(),
          oldValues: currentSetting,
          newValues: updateData,
          description: `System setting updated: ${currentSetting.key}`
        }
      });
    }

    return NextResponse.json({
      settings: updatedSettings,
      updated: updatedSettings.length
    });

  } catch (error) {
    console.error("Admin settings update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}