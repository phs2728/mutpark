import { NextRequest } from "next/server";
import { registerUserSchema } from "@/lib/validators";
import { errorResponse, successResponse } from "@/lib/api";
import { registerUser, issueSession } from "@/services/auth-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerUserSchema.parse(body);

    const user = await registerUser(data);
    const response = successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        locale: user.locale,
        role: user.role,
      },
    });

    await issueSession(response, {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      if ((error as { issues?: unknown }).issues) {
        return errorResponse("Invalid request payload", 400);
      }
      if (error.message.includes("Email already registered")) {
        return errorResponse("Email already registered", 409);
      }
      return errorResponse(error.message, 400);
    }
    return errorResponse("Unexpected error", 500);
  }
}
