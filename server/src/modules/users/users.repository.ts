import { AuditAction, AuditLog, Prisma, UserRole, UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateUserInput, UpdateUserInput, ListUsersQuery } from "./users.validation";
import { AuditContext } from "./users.types";

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  studentNumber: true,
  staffNumber: true,
  role: true,
  status: true,
  gender: true,
  profilePicture: true,
  emailVerified: true,
  lastLoginAt: true,
  campusId: true,
  facultyId: true,
  programmeId: true,
  yearOfStudy: true,
  createdAt: true,
  updatedAt: true,
  campus: { select: { id: true, name: true, code: true } },
  faculty: { select: { id: true, name: true, code: true } },
  programme: { select: { id: true, name: true, code: true } },
} as const;

type UserWithSelect = Prisma.UserGetPayload<{ select: typeof userSelect }>;

export class UsersRepository {
  async findAll(query: ListUsersQuery): Promise<{ users: UserWithSelect[]; total: number }> {
    const { page, limit, search, sortBy, sortOrder, role, status, campusId, facultyId, programmeId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { studentNumber: { contains: search } },
        { staffNumber: { contains: search } },
      ];
    }

    if (role) where.role = role;
    if (status) where.status = status;
    if (campusId) where.campusId = campusId;
    if (facultyId) where.facultyId = facultyId;
    if (programmeId) where.programmeId = programmeId;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async findById(id: string): Promise<UserWithSelect | null> {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
  }

  async create(data: CreateUserInput, passwordHash: string): Promise<UserWithSelect> {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        studentNumber: data.studentNumber,
        staffNumber: data.staffNumber,
        role: data.role,
        status: UserStatus.ACTIVE,
        gender: data.gender,
        campusId: data.campusId,
        facultyId: data.facultyId,
        programmeId: data.programmeId,
        yearOfStudy: data.yearOfStudy,
      },
      select: userSelect,
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<UserWithSelect> {
    return prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  }

  async updateStatus(id: string, status: UserStatus): Promise<UserWithSelect> {
    return prisma.user.update({
      where: { id },
      data: { status },
      select: userSelect,
    });
  }

  async updateRole(id: string, role: UserRole): Promise<UserWithSelect> {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: userSelect,
    });
  }

  async softDelete(id: string): Promise<UserWithSelect> {
    return prisma.user.update({
      where: { id },
      data: { status: UserStatus.INACTIVE },
      select: userSelect,
    });
  }

  async createAuditLog(
    data: {
      actorId: string;
      action: AuditAction;
      entityType: string;
      entityId: string;
      beforeJson?: Record<string, unknown> | null;
      afterJson?: Record<string, unknown> | null;
    },
    ctx?: AuditContext
  ): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        beforeJson: (data.beforeJson as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        afterJson: (data.afterJson as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        ipAddress: ctx?.ipAddress ?? null,
        userAgent: ctx?.userAgent ?? null,
      },
    });
  }
}
