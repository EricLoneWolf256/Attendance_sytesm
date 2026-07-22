import { AuditAction, AuditLog, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateDepartmentInput, UpdateDepartmentInput, ListDepartmentsQuery } from "./departments.validation";
import { AuditContext } from "./departments.types";

const departmentSelect = {
  id: true,
  name: true,
  code: true,
  facultyId: true,
  hodId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  faculty: { select: { id: true, name: true, code: true } },
  hod: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { programmes: true, courses: true } },
} as const;

const departmentDetailSelect = {
  ...departmentSelect,
  programmes: {
    select: { id: true, name: true, code: true, level: true, isActive: true },
  },
  courses: {
    select: { id: true, code: true, title: true, creditUnits: true, isActive: true },
  },
} as const;

type DepartmentWithSelect = Prisma.DepartmentGetPayload<{ select: typeof departmentSelect }>;
type DepartmentDetailWithSelect = Prisma.DepartmentGetPayload<{ select: typeof departmentDetailSelect }>;

export class DepartmentsRepository {
  async findAll(query: ListDepartmentsQuery): Promise<{ departments: DepartmentWithSelect[]; total: number }> {
    const { page, limit, search, sortBy, sortOrder, facultyId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.DepartmentWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
    }

    if (facultyId) where.facultyId = facultyId;
    if (isActive !== undefined) where.isActive = isActive;

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        select: departmentSelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.department.count({ where }),
    ]);

    return { departments, total };
  }

  async findById(id: string): Promise<DepartmentDetailWithSelect | null> {
    return prisma.department.findUnique({
      where: { id },
      select: departmentDetailSelect,
    });
  }

  async findByNameAndFaculty(name: string, facultyId: string) {
    return prisma.department.findFirst({
      where: { name, facultyId },
      select: { id: true, name: true },
    });
  }

  async findByCodeAndFaculty(code: string, facultyId: string) {
    return prisma.department.findFirst({
      where: { code, facultyId },
      select: { id: true, code: true },
    });
  }

  async create(data: CreateDepartmentInput): Promise<DepartmentWithSelect> {
    return prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        facultyId: data.facultyId,
        hodId: data.hodId,
      },
      select: departmentSelect,
    });
  }

  async update(id: string, data: UpdateDepartmentInput): Promise<DepartmentWithSelect> {
    return prisma.department.update({
      where: { id },
      data,
      select: departmentSelect,
    });
  }

  async softDelete(id: string): Promise<DepartmentWithSelect> {
    return prisma.department.update({
      where: { id },
      data: { isActive: false },
      select: departmentSelect,
    });
  }

  async countProgrammes(id: string): Promise<number> {
    return prisma.programme.count({ where: { departmentId: id } });
  }

  async countCourses(id: string): Promise<number> {
    return prisma.course.count({ where: { departmentId: id } });
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
