import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type");
    const offset = (page - 1) * limit;

    const where = type ? { type: type as "RECIPE" | "REVIEW" | "TIP" } : {};

    const posts = await prisma.communityPost.findMany({
      where: {
        status: "PUBLISHED",
        ...where,
      },
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
        recipe: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    const total = await prisma.communityPost.count({
      where: {
        status: "PUBLISHED",
        ...where,
      },
    });

    const transformedPosts = posts.map((post) => ({
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
      recipe: post.recipe,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
    }));

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching community posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch community posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authorId, type, title, content, imageUrl, tags, productId, recipeId } = body;

    if (!authorId || !type || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const post = await prisma.communityPost.create({
      data: {
        authorId,
        type,
        title,
        content,
        imageUrl,
        tags,
        productId,
        recipeId,
        publishedAt: new Date(),
        status: "PUBLISHED",
      },
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
        recipe: {
          select: {
            id: true,
            title: true,
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
      recipe: post.recipe,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
    };

    return NextResponse.json(transformedPost, { status: 201 });
  } catch (error) {
    console.error("Error creating community post:", error);
    return NextResponse.json(
      { error: "Failed to create community post" },
      { status: 500 }
    );
  }
}