import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const ACCESS_TOKEN_TTL = "1h";
const REFRESH_TOKEN_TTL = "30d";

export interface AccessTokenPayload {
  userId: number;
  email: string;
  role: string;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Please configure it in your environment.");
  }
  return secret;
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_TTL });
}

export interface RefreshTokenPayload extends AccessTokenPayload {
  tokenId: number;
}

export function createRefreshToken(payload: RefreshTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: REFRESH_TOKEN_TTL });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as RefreshTokenPayload;
}

export async function verifyAdminToken(request: NextRequest | Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      // Try to get token from cookies (check both admin-token and auth-token)
      const adminToken = request.cookies.get("admin-token")?.value;
      const authToken = request.cookies.get("auth-token")?.value;
      const cookieToken = adminToken || authToken;

      if (!cookieToken) {
        return { success: false, error: "No token provided" };
      }

      let payload;
      try {
        payload = verifyAccessToken(cookieToken);
      } catch (error) {
        // Try to verify as JWT directly (for admin tokens)
        try {
          payload = jwt.verify(cookieToken, getJwtSecret()) as AccessTokenPayload;
        } catch (jwtError) {
          return { success: false, error: "Invalid token" };
        }
      }

      // Check if user has admin privileges
      if (!["ADMIN", "SUPER_ADMIN", "MODERATOR", "OPERATOR"].includes(payload.role)) {
        return { success: false, error: "Insufficient privileges" };
      }

      return { success: true, user: payload };
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      // Try to verify as JWT directly (for admin tokens)
      try {
        payload = jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
      } catch (jwtError) {
        return { success: false, error: "Invalid token" };
      }
    }

    // Check if user has admin privileges
    if (!["ADMIN", "SUPER_ADMIN", "MODERATOR", "OPERATOR"].includes(payload.role)) {
      return { success: false, error: "Insufficient privileges" };
    }

    return { success: true, user: payload };
  } catch (error) {
    return { success: false, error: "Invalid token" };
  }
}
