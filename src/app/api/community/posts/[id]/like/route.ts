import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/session";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authed = await getAuthenticatedUser();
    if (!authed?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const existingLike = await prisma.communityPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: authed.userId,
        },
      },
    });

    if (existingLike) {
      await prisma.communityPostLike.delete({
        where: { id: existingLike.id },
      });

      const updatedPost = await prisma.communityPost.update({
        where: { id: postId },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({
        liked: false,
        likesCount: updatedPost.likesCount
      });
    } else {
      await prisma.communityPostLike.create({
        data: {
          postId,
          userId: authed.userId,
        },
      });

      const updatedPost = await prisma.communityPost.update({
        where: { id: postId },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({
        liked: true,
        likesCount: updatedPost.likesCount
      });
    }
  } catch (error) {
    console.error("Error toggling post like:", error);
    return NextResponse.json(
      { error: "Failed to toggle post like" },
      { status: 500 }
    );
  }
}