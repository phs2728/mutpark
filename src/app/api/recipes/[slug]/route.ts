import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/session";

interface Params {
  slug: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { slug } = await params;

    const recipe = await prisma.recipe.findUnique({
      where: {
        slug,
        status: "PUBLISHED",
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
                price: true,
                currency: true,
                imageUrl: true,
                halalCertified: true,
                stock: true,
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
    });

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    // Check if current user has liked this recipe
    const user = await getAuthenticatedUser();
    let isLiked = false;
    if (user?.userId) {
      const like = await prisma.recipeLike.findUnique({
        where: {
          recipeId_userId: {
            recipeId: recipe.id,
            userId: user.userId,
          },
        },
      });
      isLiked = !!like;
    }

    return NextResponse.json({
      ...recipe,
      isLiked,
    });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    // Check if recipe exists and user is the author
    const existingRecipe = await prisma.recipe.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });

    if (!existingRecipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    if (existingRecipe.authorId !== user.userId && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

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

    // Update recipe
    const updatedRecipe = await prisma.$transaction(async (tx) => {
      // Delete existing ingredients
      await tx.recipeIngredient.deleteMany({
        where: { recipeId: existingRecipe.id },
      });

      // Update recipe
      const recipe = await tx.recipe.update({
        where: { id: existingRecipe.id },
        data: {
          title,
          content,
          mainImageUrl,
          difficulty,
          cookingTime,
          servings,
          dietaryTags: dietaryTags || [],
          koreanOrigin,
          turkeyAdapted,
          status: "PENDING", // Reset status for moderation
          ingredients: {
            create: ingredients?.map((ingredient: Record<string, unknown>, index: number) => ({
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

      return recipe;
    });

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
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

    const { slug } = await params;

    // Check if recipe exists and user is the author
    const existingRecipe = await prisma.recipe.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });

    if (!existingRecipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    if (existingRecipe.authorId !== user.userId && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.recipe.delete({
      where: { id: existingRecipe.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}