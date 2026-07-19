import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import prisma from "../lib/prisma";
import { config } from "../config";
import { Role } from "@prisma/client";

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  static async login(email: string, password: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new Error("Invalid credentials");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new Error("Invalid credentials");
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.accessToken,
        ipAddress,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return {
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
      ...tokens,
    };
  }

  static async generateTokens(userId: string, email: string, role: Role) {
    const accessToken = jwt.sign({ id: userId, email, role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as string,
    } as jwt.SignOptions);

    const refreshToken = uuidv4();
    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  static async refresh(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new Error("Invalid refresh token");
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.generateTokens(
      stored.user.id,
      stored.user.email,
      stored.user.role
    );
  }

  static async logout(userId: string) {
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
