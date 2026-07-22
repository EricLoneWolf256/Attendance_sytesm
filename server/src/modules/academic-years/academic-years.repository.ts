import { AuditAction, AuditLog, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateAcademicYearInput, UpdateAcademicYearInput, ListAcademicYearsQuery } from "./academic-years.validation";
import { AuditContext } from "./academic-years.types";

const academicYearSelect = {
  id: true,
  code: true,
  label: true,
  startDate: true,
  endDate: true,
  isCurrent: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { semesters: true, courseOfferings: true } },
} as const;

const academicYearDetailSelect = {
  ...academicYearSelect,
  semesters: {
    select: {
      id: true,
      code: true,
      name: true,
      startDate: true,
      endDate: true,
      intakeMonth: true,
      isActive: true,
    },
    orderBy: { startDate: "asc" as const },
  },
} as const;

type AcademicYearWithSelect = Prisma.AcademicYearGetPayload<{ select: typeof academicYearSelect }>;
type AcademicYearDetailWithSelect = Prisma.AcademicYearGetPayload<{ select: typeof academicYearDetailSelect }>;

function generateCode(label: string): string {
  return label.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").toLowerCase();
}

export class AcademicYearsRepository {
  async findAll(query: ListAcademicYearsQuery): Promise<{ academicYears: AcademicYearWithSelect[]; total: number }> {
    const { page, limit, search, sortBy, sortOrder, isCurrent } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AcademicYearWhereInput = {};

    if (search) {
      where.OR = [
        { label: { contains: search } },
        { code: { contains: search } },
      ];
    }

    if (isCurrent !== undefined) where.isCurrent = isCurrent;

    const [academicYears, total] = await Promise.all([
      prisma.academicYear.findMany({
        where,
        select: academicYearSelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.academicYear.count({ where }),
    ]);

    return { academicYears, total };
  }

  async findById(id: string): Promise<AcademicYearDetailWithSelect | null> {
    return prisma.academicYear.findUnique({
      where: { id },
      select: academicYearDetailSelect,
    });
  }

  async findByLabel(label: string) {
    return prisma.academicYear.findUnique({
      where: { label },
      select: { id: true, label: true },
    });
  }

  async findByCode(code: string) {
    return prisma.academicYear.findUnique({
      where: { code },
      select: { id: true, code: true },
    });
  }

  async create(data: CreateAcademicYearInput): Promise<AcademicYearWithSelect> {
    const code = generateCode(data.label);
    return prisma.academicYear.create({
      data: {
        code,
        label: data.label,
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: data.isCurrent ?? false,
      },
      select: academicYearSelect,
    });
  }

  async update(id: string, data: UpdateAcademicYearInput): Promise<AcademicYearWithSelect> {
    const updateData: Prisma.AcademicYearUpdateInput = {};
    if (data.label !== undefined) {
      updateData.label = data.label;
      updateData.code = generateCode(data.label);
    }
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.isCurrent !== undefined) updateData.isCurrent = data.isCurrent;

    return prisma.academicYear.update({
      where: { id },
      data: updateData,
      select: academicYearSelect,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.academicYear.delete({ where: { id } });
  }

  async unsetCurrentYears(): Promise<void> {
    await prisma.academicYear.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });
  }

  async countSemesters(id: string): Promise<number> {
    return prisma.semester.count({ where: { academicYearId: id } });
  }

  async countCourseOfferings(id: string): Promise<number> {
    return prisma.courseOffering.count({ where: { academicYearId: id } });
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
