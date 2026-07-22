import { User, UserRole, UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  studentNumber: true,
  staffNumber: true,
  gender: true,
  campusId: true,
  facultyId: true,
  programmeId: true,
  yearOfStudy: true,
  status: true,
} as const;

const profileSelect = {
  ...userSelect,
  createdAt: true,
  campus: { select: { id: true, name: true, code: true } },
  faculty: { select: { id: true, name: true, code: true } },
  programme: { select: { id: true, name: true, code: true } },
} as const;

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  async findByIdWithRelations(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: profileSelect,
    });
  }

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    gender?: string;
    campusId: string;
    role: UserRole;
    status: UserStatus;
  }) {
    return prisma.user.create({
      data,
      select: userSelect,
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async createRefreshToken(data: {
    userId: string;
    token: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }) {
    return prisma.userSession.create({ data });
  }

  async findRefreshToken(token: string) {
    return prisma.userSession.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.userSession.updateMany({
      where: { token },
      data: { isActive: false },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await prisma.userSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
  }
}
