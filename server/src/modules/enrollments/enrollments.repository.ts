import { AuditAction, AuditLog, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateEnrollmentInput, UpdateEnrollmentInput, ListEnrollmentsQuery } from "./enrollments.validation";
import { AuditContext } from "./enrollments.types";

const enrollmentSelect = {
  id: true,
  studentId: true,
  courseOfferingId: true,
  classGroupId: true,
  status: true,
  enrolledAt: true,
  droppedAt: true,
  student: { select: { id: true, firstName: true, lastName: true, email: true, studentNumber: true } },
  courseOffering: {
    select: {
      id: true,
      course: { select: { code: true, title: true } },
      programme: { select: { name: true, code: true } },
      yearOfStudy: true,
    },
  },
  classGroup: { select: { id: true, name: true } },
} as const;

type EnrollmentWithSelect = Prisma.EnrollmentGetPayload<{ select: typeof enrollmentSelect }>;

export class EnrollmentsRepository {
  async findAll(query: ListEnrollmentsQuery): Promise<{ enrollments: EnrollmentWithSelect[]; total: number }> {
    const { page, limit, search, sortBy, sortOrder, courseOfferingId, studentId, classGroupId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EnrollmentWhereInput = {};

    if (search) {
      where.OR = [
        { student: { firstName: { contains: search } } },
        { student: { lastName: { contains: search } } },
        { student: { email: { contains: search } } },
      ];
    }

    if (courseOfferingId) where.courseOfferingId = courseOfferingId;
    if (studentId) where.studentId = studentId;
    if (classGroupId) where.classGroupId = classGroupId;
    if (status) where.status = status;

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        select: enrollmentSelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.enrollment.count({ where }),
    ]);

    return { enrollments, total };
  }

  async findById(id: string): Promise<EnrollmentWithSelect | null> {
    return prisma.enrollment.findUnique({
      where: { id },
      select: enrollmentSelect,
    });
  }

  async findExistingEnrollment(studentId: string, courseOfferingId: string) {
    return prisma.enrollment.findUnique({
      where: {
        studentId_courseOfferingId: { studentId, courseOfferingId },
      },
      select: { id: true, status: true },
    });
  }

  async create(data: CreateEnrollmentInput): Promise<EnrollmentWithSelect> {
    return prisma.enrollment.create({
      data: {
        studentId: data.studentId,
        courseOfferingId: data.courseOfferingId,
        classGroupId: data.classGroupId,
      },
      select: enrollmentSelect,
    });
  }

  async createMany(data: { studentId: string; courseOfferingId: string }[]): Promise<number> {
    const result = await prisma.enrollment.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  async update(id: string, data: UpdateEnrollmentInput): Promise<EnrollmentWithSelect> {
    const updateData: Prisma.EnrollmentUpdateInput = {};
    if (data.classGroupId !== undefined) updateData.classGroup = data.classGroupId ? { connect: { id: data.classGroupId } } : { disconnect: true };
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "DROPPED" || data.status === "WITHDRAWN") {
        updateData.droppedAt = new Date();
      }
    }

    return prisma.enrollment.update({
      where: { id },
      data: updateData,
      select: enrollmentSelect,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.enrollment.delete({ where: { id } });
  }

  async countByOffering(courseOfferingId: string): Promise<number> {
    return prisma.enrollment.count({
      where: { courseOfferingId, status: "ENROLLED" },
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
