import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { config } from "../config";
import { RegisterInput, LoginInput } from "../validations/auth.schema";
import { AuthPayload } from "../middleware/auth";

const SALT_ROUNDS = 10;

export class AuthService {
  static async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error("EMAIL_EXISTS");
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        gender: data.gender,
        campusId: data.campusId,
        role: "STUDENT",
        status: "active",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
        campusId: true,
        facultyId: true,
        programmeId: true,
        yearOfStudy: true,
        regNumber: true,
        status: true,
      },
    });

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    if (user.status === "suspended") {
      throw new Error("ACCOUNT_SUSPENDED");
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        regNumber: true,
        staffNumber: true,
        gender: true,
        campusId: true,
        facultyId: true,
        programmeId: true,
        yearOfStudy: true,
        status: true,
        createdAt: true,
        campus: { select: { id: true, name: true } },
        faculty: { select: { id: true, name: true } },
        programme: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      throw new Error("NOT_FOUND");
    }

    return user;
  }

  static generateToken(payload: AuthPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: 15 * 60, // 15 minutes in seconds
    });
  }

  static verifyToken(token: string): AuthPayload {
    return jwt.verify(token, config.jwtSecret) as AuthPayload;
  }
}
