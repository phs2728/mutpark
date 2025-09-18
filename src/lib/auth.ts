import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
