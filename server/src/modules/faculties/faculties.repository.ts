import { AuditAction, AuditLog, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateFacultyInput, UpdateFacultyInput, ListFacultiesQuery } from "./faculties.validation";
import { AuditContext } from "./faculties.types";

const facultySelect = {
  id: true,
  name: true,
  code: true,
  campusId: true,
  deanId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  campus: { select: { id: true, name: true, code: true } },
  dean: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { departments: true, users: true } },
} as const;

const facultyDetailSelect = {
  ...facultySelect,
  departments: {
    select: { id: true, name: true, code: true, isActive: true },
  },
} as const;

type FacultyWithSelect = Prisma.FacultyGetPayload<{ select: typeof facultySelect }>;
type FacultyDetailWithSelect = Prisma.FacultyGetPayload<{ select: typeof facultyDetailSelect }>;

export class FacultiesRepository {
  async findAll(query: ListFacultiesQuery): Promise<{ faculties: FacultyWithSelect[]; total: number }> {
    const { page, limit, search, sortBy, sortOrder, campusId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.FacultyWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
    }

    if (campusId) where.campusId = campusId;
    if (isActive !== undefined) where.isActive = isActive;

    const [faculties, total] = await Promise.all([
      prisma.faculty.findMany({
        where,
        select: facultySelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.faculty.count({ where }),
    ]);

    return { faculties, total };
  }

  async findById(id: string): Promise<FacultyDetailWithSelect | null> {
    return prisma.faculty.findUnique({
      where: { id },
      select: facultyDetailSelect,
    });
  }

  async findByName(name: string) {
    return prisma.faculty.findUnique({
      where: { name },
      select: { id: true, name: true },
    });
  }

  async findByCode(code: string) {
    return prisma.faculty.findUnique({
      where: { code },
      select: { id: true, code: true },
    });
  }

  async create(data: CreateFacultyInput): Promise<FacultyWithSelect> {
    return prisma.faculty.create({
      data: {
        name: data.name,
        code: data.code,
        campusId: data.campusId,
        deanId: data.deanId,
      },
      select: facultySelect,
    });
  }

  async update(id: string, data: UpdateFacultyInput): Promise<FacultyWithSelect> {
    return prisma.faculty.update({
      where: { id },
      data,
      select: facultySelect,
    });
  }

  async softDelete(id: string): Promise<FacultyWithSelect> {
    return prisma.faculty.update({
      where: { id },
      data: { isActive: false },
      select: facultySelect,
    });
  }

  async countDepartments(id: string): Promise<number> {
    return prisma.department.count({ where: { facultyId: id } });
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
