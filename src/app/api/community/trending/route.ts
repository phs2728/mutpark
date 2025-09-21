import { NextRequest, NextResponse } from "next/server";
import { PopularPostsService } from "@/lib/popular-posts-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const [trendingPosts, trendingTags] = await Promise.all([
      PopularPostsService.getTrendingPosts(limit),
      PopularPostsService.getTrendingTags('day')
    ]);

    return NextResponse.json({
      posts: trendingPosts,
      tags: trendingTags,
      pagination: {
        page: 1,
        limit,
        total: trendingPosts.length,
        pages: Math.ceil(trendingPosts.length / limit)
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