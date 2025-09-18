import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";
import { upsertAddressSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const addresses = await prisma.address.findMany({
      where: { userId: user.userId },
      orderBy: { isDefault: "desc" },
    });

    return successResponse({ addresses });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error(error);
    return errorResponse("Unable to fetch addresses", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const data = upsertAddressSchema.parse(body);

    const address = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: user.userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId: user.userId,
          label: data.label,
          recipientName: data.recipientName,
          phone: data.phone,
          country: data.country,
          city: data.city,
          district: data.district,
          street: data.street,
          postalCode: data.postalCode,
          addressLine2: data.addressLine2,
          isDefault: data.isDefault ?? false,
        },
      });
    });

    return successResponse(address, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    if (error instanceof Error && (error as { issues?: unknown }).issues) {
      return errorResponse("Invalid request payload", 400);
    }
    console.error(error);
    return errorResponse("Unable to create address", 500);
  }
}
