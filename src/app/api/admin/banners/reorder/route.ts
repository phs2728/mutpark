import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bannerId, newPosition, newOrder } = await request.json();

    if (!bannerId || !newPosition || newOrder === undefined) {
      return NextResponse.json(
        { error: "Banner ID, position, and order are required" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(bannerId) }
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    // Update the banner's position and order
    const updatedBanner = await prisma.banner.update({
      where: { id: parseInt(bannerId) },
      data: {
        position: newPosition,
        order: newOrder
      }
    });

    // If moving to a different position, we need to reorder other banners in that position
    if (banner.position !== newPosition) {
      // Get all banners in the new position
      const bannersInNewPosition = await prisma.banner.findMany({
        where: {
          position: newPosition,
          id: { not: parseInt(bannerId) }
        },
        orderBy: { order: "asc" }
      });

      // Reorder banners in the new position
      const updates = bannersInNewPosition.map((b, index) => {
        const orderValue = index >= newOrder ? index + 1 : index;
        return prisma.banner.update({
          where: { id: b.id },
          data: { order: orderValue }
        });
      });

      await Promise.all(updates);

      // Reorder banners in the old position
      const bannersInOldPosition = await prisma.banner.findMany({
        where: {
          position: banner.position,
          id: { not: parseInt(bannerId) }
        },
        orderBy: { order: "asc" }
      });

      const oldPositionUpdates = bannersInOldPosition.map((b, index) =>
        prisma.banner.update({
          where: { id: b.id },
          data: { order: index }
        })
      );

      await Promise.all(oldPositionUpdates);
    } else {
      // Same position, just reorder
      const bannersInPosition = await prisma.banner.findMany({
        where: {
          position: newPosition,
          id: { not: parseInt(bannerId) }
        },
        orderBy: { order: "asc" }
      });

      const updates = bannersInPosition.map((b, index) => {
        const orderValue = index >= newOrder ? index + 1 : index;
        return prisma.banner.update({
          where: { id: b.id },
          data: { order: orderValue }
        });
      });

      await Promise.all(updates);
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "UPDATE",
        entityType: "Banner",
        entityId: bannerId.toString(),
        oldValues: {
          position: banner.position,
          order: banner.order
        },
        newValues: {
          position: newPosition,
          order: newOrder
        },
        description: `Reordered banner: ${banner.title} from ${banner.position}:${banner.order} to ${newPosition}:${newOrder}`
      }
    });

    return NextResponse.json({ success: true, banner: updatedBanner });

  } catch (error) {
    console.error("Banner reorder error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}