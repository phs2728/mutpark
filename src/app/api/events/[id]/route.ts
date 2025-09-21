import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const eventId = parseInt(resolvedParams.id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            joinedAt: "desc",
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

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
      rules: event.rules,
      rewards: event.rewards as string[] || [],
      participantCount: event.participantCount,
      maxParticipants: event.maxParticipants,
      featured: event.featured,
      metadata: event.metadata,
      createdBy: event.createdBy,
      participants: event.participants.map(p => ({
        id: p.id,
        user: p.user,
        joinedAt: p.joinedAt,
        completed: p.completed,
        completedAt: p.completedAt,
        score: p.score,
      })),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const eventId = parseInt(resolvedParams.id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: "Invalid event ID" },
        { status: 400 }
      );
    }

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
      rules,
      rewards,
      maxParticipants,
      featured,
      metadata
    } = body;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (icon !== undefined) updateData.icon = icon;
    if (theme !== undefined) updateData.theme = theme;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    if (rules !== undefined) updateData.rules = rules;
    if (rewards !== undefined) updateData.rewards = rewards;
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;
    if (featured !== undefined) updateData.featured = featured;
    if (metadata !== undefined) updateData.metadata = metadata;

    // Auto-update status based on dates if dates are being updated
    if (updateData.startDate || updateData.endDate) {
      const start = updateData.startDate || existingEvent.startDate;
      const end = updateData.endDate || existingEvent.endDate;
      const now = new Date();

      if (start > now) {
        updateData.status = "UPCOMING";
      } else if (end > now) {
        updateData.status = "ACTIVE";
      } else {
        updateData.status = "ENDED";
      }
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
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
      rules: event.rules,
      rewards: event.rewards as string[] || [],
      participantCount: event.participantCount,
      maxParticipants: event.maxParticipants,
      featured: event.featured,
      metadata: event.metadata,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const eventId = parseInt(resolvedParams.id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: "Invalid event ID" },
        { status: 400 }
      );
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}