import { AuditAction, AuditLog, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateCourseOfferingInput, UpdateCourseOfferingInput, ListCourseOfferingsQuery } from "./course-offerings.validation";
import { AuditContext } from "./course-offerings.types";

const courseOfferingSelect = {
  id: true,
  courseId: true,
  programmeId: true,
  yearOfStudy: true,
  semesterId: true,
  lecturerId: true,
  classRepId: true,
  academicYearId: true,
  maxEnrollment: true,
  currentEnrollment: true,
  status: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  course: { select: { id: true, code: true, title: true, creditUnits: true } },
  programme: { select: { id: true, name: true, code: true } },
  semester: { select: { id: true, name: true, code: true } },
  academicYear: { select: { id: true, label: true, code: true } },
  lecturer: { select: { id: true, firstName: true, lastName: true, email: true } },
  classRep: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { enrollments: true, sessions: true } },
} as const;

const courseOfferingDetailSelect = {
  ...courseOfferingSelect,
  enrollments: {
    select: {
      id: true,
      studentId: true,
      status: true,
      student: { select: { id: true, firstName: true, lastName: true, email: true, studentNumber: true } },
    },
  },
} as const;

type CourseOfferingWithSelect = Prisma.CourseOfferingGetPayload<{ select: typeof courseOfferingSelect }>;
type CourseOfferingDetailWithSelect = Prisma.CourseOfferingGetPayload<{ select: typeof courseOfferingDetailSelect }>;

export class CourseOfferingsRepository {
  async findAll(query: ListCourseOfferingsQuery): Promise<{ courseOfferings: CourseOfferingWithSelect[]; total: number }> {
    const { page, limit, search, sortBy, sortOrder, courseId, programmeId, semesterId, academicYearId, lecturerId, status, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CourseOfferingWhereInput = {};

    if (search) {
      where.OR = [
        { course: { title: { contains: search } } },
        { course: { code: { contains: search } } },
      ];
    }

    if (courseId) where.courseId = courseId;
    if (programmeId) where.programmeId = programmeId;
    if (semesterId) where.semesterId = semesterId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (lecturerId) where.lecturerId = lecturerId;
    if (status) where.status = status;
    if (isActive !== undefined) where.isActive = isActive;

    const [courseOfferings, total] = await Promise.all([
      prisma.courseOffering.findMany({
        where,
        select: courseOfferingSelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.courseOffering.count({ where }),
    ]);

    return { courseOfferings, total };
  }

  async findById(id: string): Promise<CourseOfferingDetailWithSelect | null> {
    return prisma.courseOffering.findUnique({
      where: { id },
      select: courseOfferingDetailSelect,
    });
  }

  async findExistingOffering(courseId: string, programmeId: string, yearOfStudy: number, semesterId: string) {
    return prisma.courseOffering.findUnique({
      where: {
        courseId_programmeId_yearOfStudy_semesterId: {
          courseId,
          programmeId,
          yearOfStudy,
          semesterId,
        },
      },
      select: { id: true },
    });
  }

  async create(data: CreateCourseOfferingInput): Promise<CourseOfferingWithSelect> {
    return prisma.courseOffering.create({
      data: {
        courseId: data.courseId,
        programmeId: data.programmeId,
        yearOfStudy: data.yearOfStudy,
        semesterId: data.semesterId,
        lecturerId: data.lecturerId,
        classRepId: data.classRepId,
        academicYearId: data.academicYearId,
        maxEnrollment: data.maxEnrollment,
      },
      select: courseOfferingSelect,
    });
  }

  async update(id: string, data: UpdateCourseOfferingInput): Promise<CourseOfferingWithSelect> {
    return prisma.courseOffering.update({
      where: { id },
      data,
      select: courseOfferingSelect,
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.courseOffering.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async countEnrollments(id: string): Promise<number> {
    return prisma.enrollment.count({ where: { courseOfferingId: id } });
  }

  async countSessions(id: string): Promise<number> {
    return prisma.classSession.count({ where: { courseOfferingId: id } });
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
