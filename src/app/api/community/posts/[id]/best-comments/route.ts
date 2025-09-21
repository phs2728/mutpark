import { NextRequest, NextResponse } from "next/server";
import { PopularPostsService } from "@/lib/popular-posts-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const postId = parseInt(resolvedParams.id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: "Invalid post ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');

    const bestComments = await PopularPostsService.getBestComments(postId, limit);

    return NextResponse.json({
      comments: bestComments,
      meta: {
        count: bestComments.length,
        postId,
        limit
      }
    });
  } catch (error) {
    console.error("Error fetching best comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch best comments" },
      { status: 500 }
    );
  }
}