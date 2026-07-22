import { AuditAction, AuditLog, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateClassSessionInput, UpdateClassSessionInput, ListClassSessionsQuery } from "./class-sessions.validation";
import { AuditContext } from "./class-sessions.types";
import { randomBytes } from "crypto";

const classSessionSelect = {
  id: true,
  courseOfferingId: true,
  semesterId: true,
  venueId: true,
  startedBy: true,
  date: true,
  modeOfTeaching: true,
  startTime: true,
  endTime: true,
  actualStartTime: true,
  actualEndTime: true,
  duration: true,
  topic: true,
  materials: true,
  status: true,
  maxCheckInTime: true,
  lecturerConfirmedAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
  courseOffering: {
    select: {
      id: true,
      course: { select: { code: true, title: true } },
      programme: { select: { name: true, code: true } },
      semester: { select: { name: true, code: true } },
    },
  },
  venue: { select: { id: true, name: true, code: true, capacity: true } },
  starter: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { attendanceRecords: true } },
} as const;

const classSessionDetailSelect = {
  ...classSessionSelect,
  attendanceRecords: {
    select: {
      id: true,
      studentId: true,
      status: true,
      signedInAt: true,
      signInMethod: true,
      student: { select: { id: true, firstName: true, lastName: true, email: true, studentNumber: true } },
    },
  },
} as const;

type ClassSessionWithSelect = Prisma.ClassSessionGetPayload<{ select: typeof classSessionSelect }>;
type ClassSessionDetailWithSelect = Prisma.ClassSessionGetPayload<{ select: typeof classSessionDetailSelect }>;

export class ClassSessionsRepository {
  async findAll(query: ListClassSessionsQuery): Promise<{ classSessions: ClassSessionWithSelect[]; total: number }> {
    const { page, limit, search, sortBy, sortOrder, courseOfferingId, semesterId, venueId, startedBy, status, modeOfTeaching, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ClassSessionWhereInput = {};

    if (search) {
      where.OR = [
        { topic: { contains: search } },
        { courseOffering: { course: { title: { contains: search } } } },
        { courseOffering: { course: { code: { contains: search } } } },
      ];
    }

    if (courseOfferingId) where.courseOfferingId = courseOfferingId;
    if (semesterId) where.semesterId = semesterId;
    if (venueId) where.venueId = venueId;
    if (startedBy) where.startedBy = startedBy;
    if (status) where.status = status;
    if (modeOfTeaching) where.modeOfTeaching = modeOfTeaching;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    const [classSessions, total] = await Promise.all([
      prisma.classSession.findMany({
        where,
        select: classSessionSelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.classSession.count({ where }),
    ]);

    return { classSessions, total };
  }

  async findById(id: string): Promise<ClassSessionDetailWithSelect | null> {
    return prisma.classSession.findUnique({
      where: { id },
      select: classSessionDetailSelect,
    });
  }

  async create(data: CreateClassSessionInput, startedBy: string): Promise<ClassSessionWithSelect> {
    const qrSecret = randomBytes(32).toString("hex");

    return prisma.classSession.create({
      data: {
        courseOfferingId: data.courseOfferingId,
        semesterId: data.semesterId,
        venueId: data.venueId,
        startedBy,
        date: data.date,
        modeOfTeaching: data.modeOfTeaching,
        startTime: data.startTime,
        endTime: data.endTime,
        topic: data.topic,
        materials: data.materials,
        maxCheckInTime: data.maxCheckInTime,
        qrSecret,
      },
      select: classSessionSelect,
    });
  }

  async update(id: string, data: UpdateClassSessionInput): Promise<ClassSessionWithSelect> {
    return prisma.classSession.update({
      where: { id },
      data,
      select: classSessionSelect,
    });
  }

  async startSession(id: string): Promise<ClassSessionWithSelect> {
    return prisma.classSession.update({
      where: { id },
      data: {
        status: "OPEN",
        actualStartTime: new Date(),
      },
      select: classSessionSelect,
    });
  }

  async closeSession(id: string): Promise<ClassSessionWithSelect> {
    return prisma.classSession.update({
      where: { id },
      data: {
        status: "CLOSED",
        actualEndTime: new Date(),
        closedAt: new Date(),
      },
      select: classSessionSelect,
    });
  }

  async cancelSession(id: string): Promise<ClassSessionWithSelect> {
    return prisma.classSession.update({
      where: { id },
      data: { status: "CANCELLED" },
      select: classSessionSelect,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.classSession.delete({ where: { id } });
  }

  async resolveOffering(offeringId: string): Promise<{ facultyId: string } | null> {
    const offering = await prisma.courseOffering.findUnique({
      where: { id: offeringId },
      select: {
        programme: { select: { department: { select: { facultyId: true } } } },
      },
    });
    return offering?.programme?.department?.facultyId
      ? { facultyId: offering.programme.department.facultyId }
      : null;
  }

  async countAttendanceRecords(id: string): Promise<number> {
    return prisma.attendanceRecord.count({ where: { sessionId: id } });
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
