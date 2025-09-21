import { NextRequest, NextResponse } from "next/server";
import { PopularPostsService } from "@/lib/popular-posts-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const page = parseInt(searchParams.get('page') || '1');

    const [{ posts: trendingPosts, total }, trendingTags] = await Promise.all([
      PopularPostsService.getTrendingPostsPaged({ limit, page }),
      PopularPostsService.getTrendingTags('day')
    ]);

    return NextResponse.json({
      posts: trendingPosts,
      tags: trendingTags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      meta: {
        postsCount: trendingPosts.length,
        tagsCount: trendingTags.length,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error fetching trending content:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending content" },
      { status: 500 }
    );
  }
}