import { NextRequest, NextResponse } from "next/server";
import { PopularPostsService } from "@/lib/popular-posts-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = parseInt(searchParams.get('userId') || '0');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

  const { posts: personalizedFeed, total } = await PopularPostsService.getPersonalizedFeedPaged(userId, page, limit);

    return NextResponse.json({
      posts: personalizedFeed,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      meta: {
        count: personalizedFeed.length,
        page,
        limit,
        userId
      }
    });
  } catch (error) {
    console.error("Error fetching personalized feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch personalized feed" },
      { status: 500 }
    );
  }
}