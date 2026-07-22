import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AuthPayload } from "../middleware/auth";
import { socketLogger } from "./logger";

export function authenticateSocket(socket: Socket): AuthPayload | null {
  const token =
    (socket.handshake.auth?.token as string) ||
    parseCookieToken(socket.handshake.headers?.cookie);

  if (!token) {
    socketLogger.warn(`Connection rejected: no token [socket=${socket.id}]`);
    socket.disconnect(true);
    return null;
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthPayload;
    return payload;
  } catch {
    socketLogger.warn(`Connection rejected: invalid token [socket=${socket.id}]`);
    socket.disconnect(true);
    return null;
  }
}

function parseCookieToken(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/accessToken=([^;]+)/);
  return match?.[1] ?? null;
}
