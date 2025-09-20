import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/session";

interface Params {
  id: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const commentId = parseInt(id);

    // 댓글 존재 확인
    const comment = await prisma.communityPostComment.findUnique({
      where: { id: commentId, status: "PUBLISHED" },
      select: { id: true },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // 이미 좋아요했는지 확인
    const existingLike = await prisma.communityCommentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: user.userId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "Comment already liked" },
        { status: 400 }
      );
    }

    // 좋아요 생성 및 카운트 업데이트
    await prisma.$transaction(async (tx) => {
      await tx.communityCommentLike.create({
        data: {
          commentId,
          userId: user.userId,
        },
      });

      await tx.communityPostComment.update({
        where: { id: commentId },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error liking comment:", error);
    return NextResponse.json(
      { error: "Failed to like comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const commentId = parseInt(id);

    // 좋아요 존재 확인
    const existingLike = await prisma.communityCommentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: user.userId,
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json(
        { error: "Comment not liked" },
        { status: 400 }
      );
    }

    // 좋아요 삭제 및 카운트 업데이트
    await prisma.$transaction(async (tx) => {
      await tx.communityCommentLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      await tx.communityPostComment.update({
        where: { id: commentId },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unliking comment:", error);
    return NextResponse.json(
      { error: "Failed to unlike comment" },
      { status: 500 }
    );
  }
}