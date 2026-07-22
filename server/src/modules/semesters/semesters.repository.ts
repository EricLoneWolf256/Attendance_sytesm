import { AuditAction, AuditLog, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateSemesterInput, UpdateSemesterInput, ListSemestersQuery } from "./semesters.validation";
import { AuditContext } from "./semesters.types";

const semesterSelect = {
  id: true,
  code: true,
  academicYearId: true,
  name: true,
  startDate: true,
  endDate: true,
  intakeMonth: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  academicYear: { select: { id: true, label: true, code: true } },
  _count: { select: { courseOfferings: true, classReps: true, classSessions: true } },
} as const;

type SemesterWithSelect = Prisma.SemesterGetPayload<{ select: typeof semesterSelect }>;

function generateCode(name: string, academicYearId: string): string {
  const slug = name.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").toLowerCase();
  return `${academicYearId.slice(0, 8)}-${slug}`;
}

export class SemestersRepository {
  async findAll(query: ListSemestersQuery): Promise<{ semesters: SemesterWithSelect[]; total: number }> {
    const { page, limit, search, sortBy, sortOrder, academicYearId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SemesterWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
    }

    if (academicYearId) where.academicYearId = academicYearId;
    if (isActive !== undefined) where.isActive = isActive;

    const [semesters, total] = await Promise.all([
      prisma.semester.findMany({
        where,
        select: semesterSelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.semester.count({ where }),
    ]);

    return { semesters, total };
  }

  async findById(id: string): Promise<SemesterWithSelect | null> {
    return prisma.semester.findUnique({
      where: { id },
      select: semesterSelect,
    });
  }

  async findByNameAndYear(name: string, academicYearId: string) {
    return prisma.semester.findFirst({
      where: { name, academicYearId },
      select: { id: true, name: true },
    });
  }

  async findByCodeAndYear(code: string, academicYearId: string) {
    return prisma.semester.findFirst({
      where: { code, academicYearId },
      select: { id: true, code: true },
    });
  }

  async create(data: CreateSemesterInput): Promise<SemesterWithSelect> {
    const code = generateCode(data.name, data.academicYearId);
    return prisma.semester.create({
      data: {
        code,
        academicYearId: data.academicYearId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        intakeMonth: data.intakeMonth,
        isActive: data.isActive ?? false,
      },
      select: semesterSelect,
    });
  }

  async update(id: string, data: UpdateSemesterInput): Promise<SemesterWithSelect> {
    const updateData: Prisma.SemesterUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.intakeMonth !== undefined) updateData.intakeMonth = data.intakeMonth;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.semester.update({
      where: { id },
      data: updateData,
      select: semesterSelect,
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.semester.delete({ where: { id } });
  }

  async unsetActiveSemesters(): Promise<void> {
    await prisma.semester.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  async countCourseOfferings(id: string): Promise<number> {
    return prisma.courseOffering.count({ where: { semesterId: id } });
  }

  async countClassSessions(id: string): Promise<number> {
    return prisma.classSession.count({ where: { semesterId: id } });
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
