import { NextRequest, NextResponse } from "next/server";
import { BadgeService } from "@/lib/badge-service";
import { getAuthenticatedUser } from "@/lib/session";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const badges = await BadgeService.getUserBadges(userId);

    return NextResponse.json(badges);
  } catch (error) {
    console.error("Error fetching user badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const userId = parseInt(id);

    if (isNaN(userId) || userId !== user.userId) {
      return NextResponse.json(
        { error: "Invalid user ID or unauthorized" },
        { status: 400 }
      );
    }

    // 배지 조건 확인 및 부여
    const newBadges = await BadgeService.checkAndAwardBadges(userId);

    return NextResponse.json({
      newBadges,
      message: newBadges.length > 0 ? `${newBadges.length}개의 새 배지를 획득했습니다!` : "조건을 만족하는 새 배지가 없습니다."
    });
  } catch (error) {
    console.error("Error checking badges:", error);
    return NextResponse.json(
      { error: "Failed to check badges" },
      { status: 500 }
    );
  }
}