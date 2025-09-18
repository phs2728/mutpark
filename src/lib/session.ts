import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";
import { verifyAccessToken } from "./auth";

export const AUTH_COOKIE_NAME = "mutpark-token";
export const REFRESH_COOKIE_NAME = "mutpark-refresh";

export function extractTokenFromRequest(req: NextRequest) {
  const headerToken = req.headers.get("authorization");
  if (headerToken?.startsWith("Bearer ")) {
    return headerToken.split(" ")[1];
  }

  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  return cookieToken ?? null;
}

export async function getTokenFromServerContext() {
  const headerList = await headers();
  const headerAuth = headerList.get("authorization");
  if (headerAuth?.startsWith("Bearer ")) {
    return headerAuth.split(" ")[1];
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return cookieToken ?? null;
}

export async function getAuthenticatedUser() {
  const token = await getTokenFromServerContext();
  if (!token) return null;
  try {
    return verifyAccessToken(token);
  } catch (error) {
    console.error("Invalid access token", error);
    return null;
  }
}
