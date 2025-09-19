import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const postId = parseInt(id);
    const { userId } = await request.json();

    if (isNaN(postId) || !userId) {
      return NextResponse.json(
        { error: "Invalid post ID or user ID" },
        { status: 400 }
      );
    }

    const existingLike = await prisma.communityPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      await prisma.communityPostLike.delete({
        where: { id: existingLike.id },
      });

      await prisma.communityPost.update({
        where: { id: postId },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({ liked: false });
    } else {
      await prisma.communityPostLike.create({
        data: {
          postId,
          userId,
        },
      });

      await prisma.communityPost.update({
        where: { id: postId },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling post like:", error);
    return NextResponse.json(
      { error: "Failed to toggle post like" },
      { status: 500 }
    );
  }
}