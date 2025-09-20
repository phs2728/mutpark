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
    const postId = parseInt(id);
    const body = await request.json();
    const { collectionName } = body;

    // 게시물 존재 확인
    const post = await prisma.communityPost.findUnique({
      where: { id: postId, status: "PUBLISHED" },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // 이미 북마크했는지 확인
    const existingBookmark = await prisma.communityPostBookmark.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.userId,
        },
      },
    });

    if (existingBookmark) {
      return NextResponse.json(
        { error: "Post already bookmarked" },
        { status: 400 }
      );
    }

    // 북마크 생성 및 카운트 업데이트
    await prisma.$transaction(async (tx) => {
      await tx.communityPostBookmark.create({
        data: {
          postId,
          userId: user.userId,
          collectionName,
        },
      });

      await tx.communityPost.update({
        where: { id: postId },
        data: {
          bookmarksCount: {
            increment: 1,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error bookmarking post:", error);
    return NextResponse.json(
      { error: "Failed to bookmark post" },
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
    const postId = parseInt(id);

    // 북마크 존재 확인
    const existingBookmark = await prisma.communityPostBookmark.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.userId,
        },
      },
    });

    if (!existingBookmark) {
      return NextResponse.json(
        { error: "Post not bookmarked" },
        { status: 400 }
      );
    }

    // 북마크 삭제 및 카운트 업데이트
    await prisma.$transaction(async (tx) => {
      await tx.communityPostBookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      });

      await tx.communityPost.update({
        where: { id: postId },
        data: {
          bookmarksCount: {
            decrement: 1,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return NextResponse.json(
      { error: "Failed to remove bookmark" },
      { status: 500 }
    );
  }
}