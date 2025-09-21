import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/session";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authed = await getAuthenticatedUser();
    const { id } = await context.params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const comments = await prisma.communityPostComment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        likes: authed?.userId ? { where: { userId: authed.userId }, select: { id: true } } : false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    type RawComment = {
      id: number;
      postId: number;
      userId: number;
      parentId: number | null;
      content: string;
      likesCount: number;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      user: { id: number; name: string };
      likes?: Array<{ id: number }>;
    };

    const transformed = (comments as RawComment[]).map((c) => ({
      id: c.id,
      postId: c.postId,
      userId: c.userId,
      parentId: c.parentId,
      content: c.content,
      likesCount: c.likesCount,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      user: c.user,
      isLiked: authed?.userId ? Boolean(c.likes && c.likes.length > 0) : false,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
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
    const postId = parseInt(id);
    const { content, parentId, mentions } = await request.json();

    if (isNaN(postId) || !content?.trim()) {
      return NextResponse.json(
        { error: "Invalid post ID or content" },
        { status: 400 }
      );
    }

    const comment = await prisma.communityPostComment.create({
      data: {
        postId,
        userId: user.userId,
        content: content.trim(),
        parentId,
        mentions: mentions || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await prisma.communityPost.update({
      where: { id: postId },
      data: {
        commentsCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      parentId: comment.parentId,
      content: comment.content,
      likesCount: comment.likesCount,
      status: comment.status,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user,
      isLiked: false,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}