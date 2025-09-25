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
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          participants: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            },
            take: 5
          },
          _count: {
            select: {
              participants: true
            }
          }
        }
      }),
      prisma.event.count({ where })
    ]);

    const eventsWithStats = events.map(event => {
      const now = new Date();
      let computedStatus = event.status;

      // Auto-update status based on dates
      if (event.status === "UPCOMING" && now >= event.startDate) {
        computedStatus = "ACTIVE";
      } else if (event.status === "ACTIVE" && now >= event.endDate) {
        computedStatus = "ENDED";
      }

      const completedParticipants = event.participants.filter(p => p.completed).length;
      const participationRate = event._count.participants > 0
        ? (completedParticipants / event._count.participants) * 100
        : 0;

      return {
        ...event,
        computedStatus,
        participantCount: event._count.participants,
        completedParticipants,
        participationRate: Math.round(participationRate),
        daysRemaining: Math.max(0, Math.ceil(
          (event.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )),
        isActive: now >= event.startDate && now <= event.endDate
      };
    });

    return NextResponse.json({
      events: eventsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Admin events fetch error:", error);
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

    const eventData = await request.json();

    const event = await prisma.event.create({
      data: {
        ...eventData,
        createdById: authResult.user.userId,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate)
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "CREATE",
        entityType: "Event",
        entityId: event.id.toString(),
        newValues: eventData,
        description: `Event created: ${event.name}`
      }
    });

    return NextResponse.json({ event }, { status: 201 });

  } catch (error) {
    console.error("Admin event creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}