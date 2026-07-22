import { AuditAction, AuditLog, AttendanceStatus, SignInMethod, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { MarkAttendanceInput, UpdateAttendanceInput, ListAttendanceQuery } from "./attendance.validation";
import { AuditContext } from "./attendance.types";

const attendanceSelect = {
  id: true,
  sessionId: true,
  studentId: true,
  status: true,
  signedInAt: true,
  signInMethod: true,
  deviceFingerprint: true,
  student: { select: { id: true, firstName: true, lastName: true, email: true, studentNumber: true } },
} as const;

type AttendanceWithSelect = Prisma.AttendanceRecordGetPayload<{ select: typeof attendanceSelect }>;

export class AttendanceRepository {
  async findAll(query: ListAttendanceQuery): Promise<{ attendanceRecords: AttendanceWithSelect[]; total: number }> {
    const { page, limit, search, sortBy, sortOrder, sessionId, studentId, status, signInMethod } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceRecordWhereInput = {};

    if (search) {
      where.OR = [
        { student: { firstName: { contains: search } } },
        { student: { lastName: { contains: search } } },
        { student: { email: { contains: search } } },
      ];
    }

    if (sessionId) where.sessionId = sessionId;
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    if (signInMethod) where.signInMethod = signInMethod;

    const [attendanceRecords, total] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where,
        select: attendanceSelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.attendanceRecord.count({ where }),
    ]);

    return { attendanceRecords, total };
  }

  async findById(id: string): Promise<AttendanceWithSelect | null> {
    return prisma.attendanceRecord.findUnique({
      where: { id },
      select: attendanceSelect,
    });
  }

  async findExistingRecord(sessionId: string, studentId: string) {
    return prisma.attendanceRecord.findUnique({
      where: {
        sessionId_studentId: { sessionId, studentId },
      },
      select: { id: true, status: true },
    });
  }

  async create(data: MarkAttendanceInput): Promise<AttendanceWithSelect> {
    return prisma.attendanceRecord.create({
      data: {
        sessionId: data.sessionId,
        studentId: data.studentId,
        status: data.status,
        signInMethod: data.signInMethod,
        deviceFingerprint: data.deviceFingerprint,
      },
      select: attendanceSelect,
    });
  }

  async createMany(data: { sessionId: string; studentId: string; status: AttendanceStatus; signInMethod: SignInMethod }[]): Promise<number> {
    const result = await prisma.attendanceRecord.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  async update(id: string, data: UpdateAttendanceInput): Promise<AttendanceWithSelect> {
    return prisma.attendanceRecord.update({
      where: { id },
      data,
      select: attendanceSelect,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.attendanceRecord.delete({ where: { id } });
  }

  async countBySession(sessionId: string): Promise<number> {
    return prisma.attendanceRecord.count({ where: { sessionId } });
  }

  async getAttendanceStats(sessionId: string) {
    const [total, present, late, absent, excused] = await Promise.all([
      prisma.attendanceRecord.count({ where: { sessionId } }),
      prisma.attendanceRecord.count({ where: { sessionId, status: "PRESENT" } }),
      prisma.attendanceRecord.count({ where: { sessionId, status: "LATE" } }),
      prisma.attendanceRecord.count({ where: { sessionId, status: "ABSENT" } }),
      prisma.attendanceRecord.count({ where: { sessionId, status: "EXCUSED" } }),
    ]);

    return { total, present, late, absent, excused };
  }

  async resolveSessionMeta(sessionId: string): Promise<{
    courseOfferingId: string;
    lecturerId: string;
    facultyId: string;
  } | null> {
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      select: {
        courseOfferingId: true,
        startedBy: true,
        courseOffering: {
          select: {
            programme: { select: { department: { select: { facultyId: true } } } },
          },
        },
      },
    });
    if (!session) return null;
    return {
      courseOfferingId: session.courseOfferingId,
      lecturerId: session.startedBy,
      facultyId: session.courseOffering?.programme?.department?.facultyId ?? "",
    };
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
