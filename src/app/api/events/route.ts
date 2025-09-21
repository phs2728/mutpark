import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status as "UPCOMING" | "ACTIVE" | "ENDED" | "CANCELLED";
    }

    if (type) {
      where.type = type as "CHALLENGE" | "CONTEST" | "CELEBRATION" | "PROMOTION";
    }

    if (featured === "true") {
      where.featured = true;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: [
        { featured: "desc" },
        { startDate: "desc" }
      ],
      skip: offset,
      take: limit,
    });

    const total = await prisma.event.count({ where });

    const transformedEvents = events.map((event) => ({
      id: event.id,
      name: event.name,
      description: event.description,
      type: event.type.toLowerCase(),
      status: event.status.toLowerCase(),
      startDate: event.startDate,
      endDate: event.endDate,
      icon: event.icon,
      theme: event.theme,
      bannerUrl: event.bannerUrl,
      rewards: event.rewards as string[] || [],
      participantCount: event.participantCount,
      maxParticipants: event.maxParticipants,
      featured: event.featured,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    return NextResponse.json({
      events: transformedEvents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      type,
      startDate,
      endDate,
      icon,
      theme,
      bannerUrl,
      rewards,
      maxParticipants,
      createdById,
      featured = false,
      metadata
    } = body;

    if (!name || !description || !type || !startDate || !endDate || !createdById) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Determine status based on dates
    const now = new Date();
    let status: "UPCOMING" | "ACTIVE" | "ENDED";

    if (start > now) {
      status = "UPCOMING";
    } else if (end > now) {
      status = "ACTIVE";
    } else {
      status = "ENDED";
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        type,
        status,
        startDate: start,
        endDate: end,
        icon,
        theme,
        bannerUrl,
        rewards,
        maxParticipants,
        createdById,
        featured,
        metadata,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: event.id,
      name: event.name,
      description: event.description,
      type: event.type.toLowerCase(),
      status: event.status.toLowerCase(),
      startDate: event.startDate,
      endDate: event.endDate,
      icon: event.icon,
      theme: event.theme,
      bannerUrl: event.bannerUrl,
      rewards: event.rewards as string[] || [],
      participantCount: event.participantCount,
      maxParticipants: event.maxParticipants,
      featured: event.featured,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}