import { AuditAction, AuditLog, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateProgrammeInput, UpdateProgrammeInput, ListProgrammesQuery } from "./programmes.validation";
import { AuditContext } from "./programmes.types";

const programmeSelect = {
  id: true,
  name: true,
  code: true,
  departmentId: true,
  level: true,
  durationYears: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  department: { select: { id: true, name: true, code: true, facultyId: true } },
  _count: { select: { courseOfferings: true, users: true, classReps: true } },
} as const;

const programmeDetailSelect = {
  ...programmeSelect,
  attendancePolicies: {
    select: { id: true, minPercentage: true, lateThreshold: true },
  },
} as const;

type ProgrammeWithSelect = Prisma.ProgrammeGetPayload<{ select: typeof programmeSelect }>;
type ProgrammeDetailWithSelect = Prisma.ProgrammeGetPayload<{ select: typeof programmeDetailSelect }>;

export class ProgrammesRepository {
  async findAll(query: ListProgrammesQuery): Promise<{ programmes: ProgrammeWithSelect[]; total: number }> {
    const { page, limit, search, sortBy, sortOrder, departmentId, level, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProgrammeWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
    }

    if (departmentId) where.departmentId = departmentId;
    if (level) where.level = level;
    if (isActive !== undefined) where.isActive = isActive;

    const [programmes, total] = await Promise.all([
      prisma.programme.findMany({
        where,
        select: programmeSelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.programme.count({ where }),
    ]);

    return { programmes, total };
  }

  async findById(id: string): Promise<ProgrammeDetailWithSelect | null> {
    return prisma.programme.findUnique({
      where: { id },
      select: programmeDetailSelect,
    });
  }

  async findByNameAndDepartment(name: string, departmentId: string) {
    return prisma.programme.findFirst({
      where: { name, departmentId },
      select: { id: true, name: true },
    });
  }

  async findByCodeAndDepartment(code: string, departmentId: string) {
    return prisma.programme.findFirst({
      where: { code, departmentId },
      select: { id: true, code: true },
    });
  }

  async create(data: CreateProgrammeInput): Promise<ProgrammeWithSelect> {
    return prisma.programme.create({
      data: {
        name: data.name,
        code: data.code,
        departmentId: data.departmentId,
        level: data.level,
        durationYears: data.durationYears,
      },
      select: programmeSelect,
    });
  }

  async update(id: string, data: UpdateProgrammeInput): Promise<ProgrammeWithSelect> {
    return prisma.programme.update({
      where: { id },
      data,
      select: programmeSelect,
    });
  }

  async softDelete(id: string): Promise<ProgrammeWithSelect> {
    return prisma.programme.update({
      where: { id },
      data: { isActive: false },
      select: programmeSelect,
    });
  }

  async countCourseOfferings(id: string): Promise<number> {
    return prisma.courseOffering.count({ where: { programmeId: id } });
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
