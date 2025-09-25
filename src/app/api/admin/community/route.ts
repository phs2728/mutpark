import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const where: any = {};

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { author: { name: { contains: search } } },
        { author: { email: { contains: search } } }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: { id: true, name: true, email: true, createdAt: true }
          },
          product: {
            select: { id: true, baseName: true, imageUrl: true }
          },
          likes: {
            include: {
              user: {
                select: { id: true, name: true }
              }
            },
            take: 5
          },
          comments: {
            include: {
              user: {
                select: { id: true, name: true }
              }
            },
            take: 3,
            orderBy: { createdAt: "desc" }
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              bookmarks: true
            }
          }
        }
      }),
      prisma.communityPost.count({ where })
    ]);

    const postsWithStats = posts.map(post => {
      const engagementRate = post.viewsCount > 0
        ? ((post._count.likes + post._count.comments) / post.viewsCount) * 100
        : 0;

      return {
        ...post,
        engagementRate: Math.round(engagementRate * 100) / 100,
        recentActivity: Math.max(
          ...post.comments.map(c => new Date(c.createdAt).getTime()),
          ...post.likes.map(l => new Date(l.createdAt).getTime()),
          new Date(post.createdAt).getTime()
        )
      };
    });

    return NextResponse.json({
      posts: postsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Admin community posts fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, action, ...updateData } = await request.json();

    const currentPost = await prisma.communityPost.findUnique({
      where: { id: postId }
    });

    if (!currentPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let updatedPost;

    switch (action) {
      case "MODERATE":
        updatedPost = await prisma.communityPost.update({
          where: { id: postId },
          data: {
            status: updateData.status,
            metadata: {
              ...currentPost.metadata,
              moderatedBy: authResult.user.userId,
              moderatedAt: new Date(),
              moderationReason: updateData.reason
            }
          }
        });
        break;

      case "FEATURE":
        updatedPost = await prisma.communityPost.update({
          where: { id: postId },
          data: { featured: updateData.featured }
        });
        break;

      default:
        updatedPost = await prisma.communityPost.update({
          where: { id: postId },
          data: updateData
        });
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "UPDATE",
        entityType: "CommunityPost",
        entityId: postId.toString(),
        oldValues: currentPost,
        newValues: updateData,
        description: `Community post ${action || "updated"}: ${currentPost.title}`
      }
    });

    return NextResponse.json({ post: updatedPost });

  } catch (error) {
    console.error("Admin community post update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}