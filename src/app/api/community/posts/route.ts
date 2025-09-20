import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type");
    const sortBy = searchParams.get("sortBy") || "latest";
    const offset = (page - 1) * limit;

    const where = type ? { type: type as "RECIPE" | "REVIEW" | "TIP" | "QUESTION" } : {};

    // 정렬 설정
    let orderBy: unknown;
    if (sortBy === "popular") {
      // 인기순: 좋아요 수 + 댓글 수 + 조회수 기준으로 정렬
      orderBy = [
        { viewsCount: "desc" },
        { publishedAt: "desc" }
      ];
    } else {
      // 최신순 (기본값)
      orderBy = {
        publishedAt: "desc",
      };
    }

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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy,
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
      images: post.images as string[] || [],
      tags: post.tags as string[] || [],
      mentions: post.mentions as number[] || [],
      // 레시피 필드
      difficulty: post.difficulty,
      cookingTime: post.cookingTime,
      servings: post.servings,
      ingredients: post.ingredients,
      instructions: post.instructions,
      // 리뷰 필드
      rating: post.rating,
      reviewType: post.reviewType,
      author: {
        name: post.author.name,
      },
      product: post.product,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      bookmarksCount: post.bookmarksCount,
      viewsCount: post.viewsCount,
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
    const {
      authorId,
      type,
      title,
      content,
      imageUrl,
      images,
      tags,
      mentions,
      productId,
      // 레시피 전용 필드
      difficulty,
      cookingTime,
      servings,
      ingredients,
      instructions,
      // 리뷰 전용 필드
      rating,
      reviewType
    } = body;

    if (!authorId || !type || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 타입별 유효성 검사
    if (type === "RECIPE" && (!difficulty || !cookingTime || !servings)) {
      return NextResponse.json(
        { error: "Recipe posts require difficulty, cookingTime, and servings" },
        { status: 400 }
      );
    }

    if (type === "REVIEW" && (!rating || rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Review posts require a valid rating (1-5)" },
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
        images,
        tags,
        mentions,
        productId,
        // 레시피 필드
        difficulty,
        cookingTime,
        servings,
        ingredients,
        instructions,
        // 리뷰 필드
        rating,
        reviewType,
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
      images: post.images as string[] || [],
      tags: post.tags as string[] || [],
      mentions: post.mentions as number[] || [],
      // 레시피 필드
      difficulty: post.difficulty,
      cookingTime: post.cookingTime,
      servings: post.servings,
      ingredients: post.ingredients,
      instructions: post.instructions,
      // 리뷰 필드
      rating: post.rating,
      reviewType: post.reviewType,
      author: {
        name: post.author.name,
      },
      product: post.product,
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