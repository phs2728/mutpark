import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty");
    const category = searchParams.get("category");
    const dietaryTags = searchParams.get("dietaryTags");
    const featured = searchParams.get("featured") === "true";

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      status: "PUBLISHED",
      publishedAt: { not: null },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (category) {
      where.category = category;
    }

    if (dietaryTags) {
      const tags = dietaryTags.split(",");
      where.dietaryTags = {
        array_contains: tags,
      };
    }

    if (featured) {
      where.featured = true;
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          ingredients: {
            include: {
              product: {
                select: {
                  id: true,
                  slug: true,
                  baseName: true,
                  imageUrl: true,
                  price: true,
                  currency: true,
                },
              },
            },
          },
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  slug: true,
                  baseName: true,
                  imageUrl: true,
                  price: true,
                  currency: true,
                },
              },
            },
          },
          steps: {
            orderBy: {
              stepNumber: "asc",
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy: [
          { featured: "desc" },
          { publishedAt: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

// POST method removed - only admins can create official recipes through admin panel