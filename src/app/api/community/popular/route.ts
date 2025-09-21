import { NextRequest, NextResponse } from "next/server";
import { PopularPostsService } from "@/lib/popular-posts-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const timeRange = searchParams.get('timeRange') as 'day' | 'week' | 'month' | 'all' || 'week';
    const postType = searchParams.get('postType') as 'recipe' | 'review' | 'tip' | 'question' | 'all' || 'all';
    const minScore = parseInt(searchParams.get('minScore') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    const page = parseInt(searchParams.get('page') || '1');
    const { posts: popularPosts, total } = await PopularPostsService.getPopularPostsPaged({
      timeRange,
      postType,
      minScore,
      limit,
      page
    });

    return NextResponse.json({
      posts: popularPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      meta: {
        count: popularPosts.length,
        timeRange,
        postType,
        minScore
      }
    });
  } catch (error) {
    console.error("Error fetching popular posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular posts" },
      { status: 500 }
    );
  }
}