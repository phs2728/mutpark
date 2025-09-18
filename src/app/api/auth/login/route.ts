import { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validators";
import { errorResponse, successResponse } from "@/lib/api";
import { issueSession, validateUserCredentials } from "@/services/auth-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await validateUserCredentials(data.email, data.password);

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

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
    if (error instanceof Error && (error as { issues?: unknown }).issues) {
      return errorResponse("Invalid request payload", 400);
    }
    return errorResponse("Unexpected error", 500);
  }
}
