import jwt from "jsonwebtoken";
import { config } from "../config";
import { AuthPayload } from "../middleware/auth";

export function generateAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiresInSeconds,
  });
}

export function generateRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresInSeconds,
  });
}

export function verifyAccessToken(token: string): AuthPayload {
  return jwt.verify(token, config.jwt.secret) as AuthPayload;
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as AuthPayload;
}

export function getAccessTokenCookieOptions(): Record<string, unknown> {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax" as const,
    maxAge: config.jwt.accessExpiresInSeconds * 1000,
    path: "/",
  };
}

export function getRefreshTokenCookieOptions(): Record<string, unknown> {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax" as const,
    maxAge: config.jwt.refreshExpiresInSeconds * 1000,
    path: "/api/auth/refresh",
  };
}
