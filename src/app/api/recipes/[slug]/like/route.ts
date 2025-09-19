import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/session";

interface Params {
  slug: string;
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

    const { slug } = await params;

    // Find the recipe
    const recipe = await prisma.recipePost.findUnique({
      where: { slug, status: "PUBLISHED" },
      select: { id: true },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await prisma.recipeLike.findUnique({
      where: {
        recipeId_userId: {
          recipeId: recipe.id,
          userId: user.userId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "Recipe already liked" },
        { status: 400 }
      );
    }

    // Create like and update count
    await prisma.$transaction(async (tx) => {
      await tx.recipeLike.create({
        data: {
          recipeId: recipe.id,
          userId: user.userId,
        },
      });

      await tx.recipePost.update({
        where: { id: recipe.id },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error liking recipe:", error);
    return NextResponse.json(
      { error: "Failed to like recipe" },
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

    // Find the recipe
    const recipe = await prisma.recipePost.findUnique({
      where: { slug, status: "PUBLISHED" },
      select: { id: true },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    // Check if like exists
    const existingLike = await prisma.recipeLike.findUnique({
      where: {
        recipeId_userId: {
          recipeId: recipe.id,
          userId: user.userId,
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json(
        { error: "Recipe not liked" },
        { status: 400 }
      );
    }

    // Remove like and update count
    await prisma.$transaction(async (tx) => {
      await tx.recipeLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      await tx.recipePost.update({
        where: { id: recipe.id },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unliking recipe:", error);
    return NextResponse.json(
      { error: "Failed to unlike recipe" },
      { status: 500 }
    );
  }
}