import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/api";
import { requireAuth } from "@/lib/auth-guard";
import { upsertAddressSchema } from "@/lib/validators";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function parseId(id: string) {
  const parsed = Number(id);
  if (Number.isNaN(parsed)) {
    throw new Error("INVALID_ID");
  }
  return parsed;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = requireAuth(request);
    const { id } = await context.params;
    const addressId = parseId(id);

    const body = await request.json();
    const data = upsertAddressSchema.parse(body);

    const address = await prisma.$transaction(async (tx) => {
      const existing = await tx.address.findUnique({ where: { id: addressId } });
      if (!existing || existing.userId !== user.userId) {
        throw new Error("NOT_FOUND");
      }

      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: user.userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const updated = await tx.address.update({
        where: { id: addressId },
        data: {
          label: data.label,
          recipientName: data.recipientName,
          phone: data.phone,
          country: data.country,
          city: data.city,
          district: data.district,
          street: data.street,
          postalCode: data.postalCode,
          addressLine2: data.addressLine2,
          isDefault: data.isDefault ?? existing.isDefault,
        },
      });

      return updated;
    });

    return successResponse(address);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_ID") {
        return errorResponse("Invalid address id", 400);
      }
      if (error.message === "UNAUTHORIZED") {
        return errorResponse("Authentication required", 401);
      }
      if (error.message === "NOT_FOUND") {
        return errorResponse("Address not found", 404);
      }
      if ((error as { issues?: unknown }).issues) {
        return errorResponse("Invalid request payload", 400);
      }
    }
    console.error(error);
    return errorResponse("Unable to update address", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = requireAuth(request);
    const { id } = await context.params;
    const addressId = parseId(id);

    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== user.userId) {
      return errorResponse("Address not found", 404);
    }

    await prisma.address.delete({ where: { id: addressId } });

    return successResponse({ message: "Address deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ID") {
      return errorResponse("Invalid address id", 400);
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Authentication required", 401);
    }
    console.error(error);
    return errorResponse("Unable to delete address", 500);
  }
}
