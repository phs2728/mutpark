import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.status !== "ACTIVE" && event.status !== "UPCOMING") {
      return NextResponse.json(
        { error: "Event is not open for participation" },
        { status: 400 }
      );
    }

    // Check if user already joined
    const existingParticipation = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { error: "User already joined this event" },
        { status: 400 }
      );
    }

    // Check participant limit
    if (event.maxParticipants && event.participantCount >= event.maxParticipants) {
      return NextResponse.json(
        { error: "Event is full" },
        { status: 400 }
      );
    }

    // Create participation and update participant count
    const [participation] = await prisma.$transaction([
      prisma.eventParticipant.create({
        data: {
          eventId,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          event: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: {
          participantCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      id: participation.id,
      user: participation.user,
      event: participation.event,
      joinedAt: participation.joinedAt,
      completed: participation.completed,
    }, { status: 201 });
  } catch (error) {
    console.error("Error joining event:", error);
    return NextResponse.json(
      { error: "Failed to join event" },
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

    const searchParams = request.nextUrl.searchParams;
    const userId = parseInt(searchParams.get("userId") || "");

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if participation exists
    const participation = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "User is not participating in this event" },
        { status: 404 }
      );
    }

    // Remove participation and update participant count
    await prisma.$transaction([
      prisma.eventParticipant.delete({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: {
          participantCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Successfully left the event" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error leaving event:", error);
    return NextResponse.json(
      { error: "Failed to leave event" },
      { status: 500 }
    );
  }
}