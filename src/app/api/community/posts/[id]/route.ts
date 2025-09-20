import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            baseName: true,
            imageUrl: true,
          },
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const transformedPost = {
      id: post.id,
      type: post.type.toLowerCase(),
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      tags: post.tags as string[],
      author: {
        name: post.author.name,
      },
      product: post.product,
      likes: post.likes.map((like) => ({
        id: like.id,
        user: like.user,
        createdAt: like.createdAt,
      })),
      comments: post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        user: comment.user,
        createdAt: comment.createdAt,
      })),
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error("Error fetching community post:", error);
    return NextResponse.json(
      { error: "Failed to fetch community post" },
      { status: 500 }
    );
  }
}