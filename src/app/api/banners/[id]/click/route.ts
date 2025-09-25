import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bannerId = parseInt(id);

    if (isNaN(bannerId)) {
      return NextResponse.json(
        { error: "Invalid banner ID" },
        { status: 400 }
      );
    }

    // Increment click count
    await prisma.banner.update({
      where: { id: bannerId },
      data: {
        clickCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Banner click tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}