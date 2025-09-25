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

    const eventId = parseInt(params.id);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, createdAt: true }
            }
          },
          orderBy: { joinedAt: "desc" }
        },
        _count: {
          select: {
            participants: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const now = new Date();
    let computedStatus = event.status;

    // Auto-update status based on dates
    if (event.status === "UPCOMING" && now >= event.startDate) {
      computedStatus = "ACTIVE";
    } else if (event.status === "ACTIVE" && now >= event.endDate) {
      computedStatus = "ENDED";
    }

    const participantStats = {
      total: event._count.participants,
      completed: event.participants.filter(p => p.completed).length,
      active: event.participants.filter(p => !p.completed && p.joinedAt).length,
      averageScore: event.participants.filter(p => p.score !== null).length > 0
        ? event.participants
            .filter(p => p.score !== null)
            .reduce((sum, p) => sum + (p.score || 0), 0) /
          event.participants.filter(p => p.score !== null).length
        : 0,
      participationRate: event._count.participants > 0
        ? (event.participants.filter(p => p.completed).length / event._count.participants) * 100
        : 0,
      dailyJoins: event.participants.reduce((daily, participant) => {
        const date = participant.joinedAt.toISOString().split('T')[0];
        daily[date] = (daily[date] || 0) + 1;
        return daily;
      }, {} as Record<string, number>)
    };

    const eventWithStats = {
      ...event,
      computedStatus,
      daysRemaining: Math.max(0, Math.ceil(
        (event.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )),
      daysActive: Math.max(0, Math.ceil(
        (now.getTime() - event.startDate.getTime()) / (1000 * 60 * 60 * 24)
      )),
      isActive: now >= event.startDate && now <= event.endDate,
      stats: participantStats
    };

    return NextResponse.json({ event: eventWithStats });

  } catch (error) {
    console.error("Admin event detail fetch error:", error);
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

    const eventId = parseInt(params.id);
    const updateData = await request.json();

    const currentEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!currentEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Process date fields
    const processedData = { ...updateData };
    if (updateData.startDate) {
      processedData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      processedData.endDate = new Date(updateData.endDate);
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...processedData,
        updatedAt: new Date()
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            participants: true
          }
        }
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "UPDATE",
        entityType: "Event",
        entityId: eventId.toString(),
        oldValues: currentEvent,
        newValues: updateData,
        description: `Event updated: ${updatedEvent.name}`
      }
    });

    return NextResponse.json({ event: updatedEvent });

  } catch (error) {
    console.error("Admin event update error:", error);
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

    const eventId = parseInt(params.id);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event has participants
    if (event._count.participants > 0) {
      return NextResponse.json(
        { error: "Cannot delete event with participants. Consider cancelling instead." },
        { status: 400 }
      );
    }

    await prisma.event.delete({
      where: { id: eventId }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "DELETE",
        entityType: "Event",
        entityId: eventId.toString(),
        oldValues: event,
        description: `Event deleted: ${event.name}`
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Admin event delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}