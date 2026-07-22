import { AuditAction, AttendanceStatus, SignInMethod } from "@prisma/client";
import { AttendanceRepository } from "./attendance.repository";
import { MarkAttendanceInput, BulkMarkAttendanceInput, UpdateAttendanceInput, ListAttendanceQuery } from "./attendance.validation";
import { PaginatedAttendanceRecords, AuditContext, AttendanceRecordDetail } from "./attendance.types";
import { ApiError } from "../../utils/ApiError";
import { emitAttendanceCheckedIn, emitAttendanceUpdated, emitAttendanceSummaryUpdated } from "../../sockets/eventBus";

const repository = new AttendanceRepository();

export class AttendanceService {
  static async list(query: ListAttendanceQuery): Promise<PaginatedAttendanceRecords> {
    const { attendanceRecords, total } = await repository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      attendanceRecords,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }

  static async getById(id: string): Promise<AttendanceRecordDetail> {
    const record = await repository.findById(id);
    if (!record) {
      throw ApiError.notFound("Attendance record not found");
    }
    return record as AttendanceRecordDetail;
  }

  static async markAttendance(
    data: MarkAttendanceInput,
    ctx: AuditContext
  ): Promise<AttendanceRecordDetail> {
    const existing = await repository.findExistingRecord(data.sessionId, data.studentId);
    if (existing) {
      throw ApiError.conflict("Attendance already recorded for this student in this session");
    }

    const record = await repository.create(data);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.CHECK_IN,
        entityType: "AttendanceRecord",
        entityId: record.id,
        afterJson: record as unknown as Record<string, unknown>,
      },
      ctx
    );

    const meta = await repository.resolveSessionMeta(data.sessionId);
    if (meta) {
      const stats = await repository.getAttendanceStats(data.sessionId);
      emitAttendanceCheckedIn({
        sessionId: data.sessionId,
        courseOfferingId: meta.courseOfferingId,
        lecturerId: meta.lecturerId,
        facultyId: meta.facultyId,
        record: record as unknown as Record<string, unknown>,
        stats,
      });
    }

    return record as AttendanceRecordDetail;
  }

  static async bulkMarkAttendance(
    data: BulkMarkAttendanceInput,
    ctx: AuditContext
  ): Promise<{ marked: number; skipped: number }> {
    const pairs = data.records.map((r) => ({
      sessionId: data.sessionId,
      studentId: r.studentId,
      status: r.status as AttendanceStatus,
      signInMethod: data.signInMethod as SignInMethod,
    }));

    const count = await repository.createMany(pairs);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.CHECK_IN,
        entityType: "AttendanceRecord",
        entityId: data.sessionId,
        afterJson: { bulkMark: true, count } as unknown as Record<string, unknown>,
      },
      ctx
    );

    if (count > 0) {
      const meta = await repository.resolveSessionMeta(data.sessionId);
      if (meta) {
        const stats = await repository.getAttendanceStats(data.sessionId);
        emitAttendanceSummaryUpdated({
          sessionId: data.sessionId,
          courseOfferingId: meta.courseOfferingId,
          stats,
        });
      }
    }

    return { marked: count, skipped: pairs.length - count };
  }

  static async update(
    id: string,
    data: UpdateAttendanceInput,
    ctx: AuditContext
  ): Promise<AttendanceRecordDetail> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Attendance record not found");
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const record = await repository.update(id, data);
    const afterSnapshot = record as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "AttendanceRecord",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    const meta = await repository.resolveSessionMeta(existing.sessionId);
    if (meta) {
      const stats = await repository.getAttendanceStats(existing.sessionId);
      emitAttendanceUpdated({
        sessionId: existing.sessionId,
        courseOfferingId: meta.courseOfferingId,
        record: afterSnapshot,
        stats,
      });
    }

    return record as AttendanceRecordDetail;
  }

  static async delete(
    id: string,
    ctx: AuditContext
  ): Promise<{ message: string }> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Attendance record not found");
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;

    await repository.delete(id);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.DELETE,
        entityType: "AttendanceRecord",
        entityId: id,
        beforeJson: beforeSnapshot,
      },
      ctx
    );

    return { message: "Attendance record deleted successfully" };
  }

  static async getSessionStats(sessionId: string) {
    const stats = await repository.getAttendanceStats(sessionId);
    return stats;
  }
}
