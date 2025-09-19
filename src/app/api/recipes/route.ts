import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty");
    const dietaryTags = searchParams.get("dietaryTags");
    const featured = searchParams.get("featured") === "true";

    const skip = (page - 1) * limit;

    const where: any = {
      status: "PUBLISHED",
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { search: search } },
      ];
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (dietaryTags) {
      const tags = dietaryTags.split(",");
      where.dietaryTags = {
        array_contains: tags,
      };
    }

    if (featured) {
      where.featuredAt = { not: null };
    }

    const [recipes, total] = await Promise.all([
      prisma.recipePost.findMany({
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
                  translations: true,
                },
              },
            },
            orderBy: { order: "asc" },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy: [
          { featuredAt: "desc" },
          { publishedAt: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.recipePost.count({ where }),
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

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      mainImageUrl,
      difficulty,
      cookingTime,
      servings,
      dietaryTags,
      koreanOrigin,
      turkeyAdapted,
      ingredients,
    } = body;

    if (!title || !content || !cookingTime || !servings) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
      + "-" + Date.now();

    const recipe = await prisma.recipePost.create({
      data: {
        authorId: user.userId,
        title,
        slug,
        content,
        mainImageUrl,
        difficulty: difficulty || "EASY",
        cookingTime,
        servings,
        dietaryTags: dietaryTags || [],
        koreanOrigin: koreanOrigin || false,
        turkeyAdapted: turkeyAdapted || false,
        status: "PENDING",
        ingredients: {
          create: ingredients?.map((ingredient: any, index: number) => ({
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            productId: ingredient.productId,
            isEssential: ingredient.isEssential ?? true,
            alternatives: ingredient.alternatives || [],
            order: index,
          })) || [],
        },
      },
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
                translations: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}