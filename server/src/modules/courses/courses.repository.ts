import { AuditAction, AuditLog, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateCourseInput, UpdateCourseInput, ListCoursesQuery } from "./courses.validation";
import { AuditContext } from "./courses.types";

const courseSelect = {
  id: true,
  code: true,
  title: true,
  description: true,
  creditUnits: true,
  departmentId: true,
  level: true,
  prerequisites: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  department: { select: { id: true, name: true, code: true } },
  _count: { select: { courseOfferings: true } },
} as const;

type CourseWithSelect = Prisma.CourseGetPayload<{ select: typeof courseSelect }>;

export class CoursesRepository {
  async findAll(query: ListCoursesQuery): Promise<{ courses: CourseWithSelect[]; total: number }> {
    const { page, limit, search, sortBy, sortOrder, departmentId, level, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { code: { contains: search } },
      ];
    }

    if (departmentId) where.departmentId = departmentId;
    if (level !== undefined) where.level = level;
    if (isActive !== undefined) where.isActive = isActive;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        select: courseSelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    return { courses, total };
  }

  async findById(id: string): Promise<CourseWithSelect | null> {
    return prisma.course.findUnique({
      where: { id },
      select: courseSelect,
    });
  }

  async findByCode(code: string) {
    return prisma.course.findUnique({
      where: { code },
      select: { id: true, code: true },
    });
  }

  async create(data: CreateCourseInput): Promise<CourseWithSelect> {
    return prisma.course.create({
      data: {
        code: data.code,
        title: data.title,
        description: data.description,
        creditUnits: data.creditUnits,
        departmentId: data.departmentId,
        level: data.level,
        prerequisites: data.prerequisites,
      },
      select: courseSelect,
    });
  }

  async update(id: string, data: UpdateCourseInput): Promise<CourseWithSelect> {
    return prisma.course.update({
      where: { id },
      data,
      select: courseSelect,
    });
  }

  async softDelete(id: string): Promise<CourseWithSelect> {
    return prisma.course.update({
      where: { id },
      data: { isActive: false },
      select: courseSelect,
    });
  }

  async countCourseOfferings(id: string): Promise<number> {
    return prisma.courseOffering.count({ where: { courseId: id } });
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
