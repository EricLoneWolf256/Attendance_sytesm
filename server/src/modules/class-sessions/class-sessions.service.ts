import { AuditAction } from "@prisma/client";
import { ClassSessionsRepository } from "./class-sessions.repository";
import { CreateClassSessionInput, UpdateClassSessionInput, ListClassSessionsQuery } from "./class-sessions.validation";
import { PaginatedClassSessions, AuditContext, ClassSessionDetail } from "./class-sessions.types";
import { ApiError } from "../../utils/ApiError";
import { emitSessionCreated, emitSessionStarted, emitSessionUpdated, emitSessionClosed } from "../../sockets/eventBus";

const repository = new ClassSessionsRepository();

export class ClassSessionsService {
  static async list(query: ListClassSessionsQuery): Promise<PaginatedClassSessions> {
    const { classSessions, total } = await repository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      classSessions,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }

  static async getById(id: string): Promise<ClassSessionDetail> {
    const session = await repository.findById(id);
    if (!session) {
      throw ApiError.notFound("Class session not found");
    }
    return session as ClassSessionDetail;
  }

  static async create(
    data: CreateClassSessionInput,
    ctx: AuditContext
  ): Promise<ClassSessionDetail> {
    const session = await repository.create(data, ctx.actorId);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.CREATE,
        entityType: "ClassSession",
        entityId: session.id,
        afterJson: session as unknown as Record<string, unknown>,
      },
      ctx
    );

    const courseOffering = (session as Record<string, unknown>).courseOffering as Record<string, unknown> | undefined;
    const coId = (session as Record<string, unknown>).courseOfferingId as string;
    const offeringRecord = await this.resolveOfferingMeta(coId);

    emitSessionCreated({
      sessionId: session.id,
      courseOfferingId: coId,
      lecturerId: ctx.actorId,
      facultyId: offeringRecord?.facultyId ?? "",
      date: String((session as Record<string, unknown>).date),
      topic: (session as Record<string, unknown>).topic as string | null,
    });

    return session as ClassSessionDetail;
  }

  static async update(
    id: string,
    data: UpdateClassSessionInput,
    ctx: AuditContext
  ): Promise<ClassSessionDetail> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Class session not found");
    }

    if (existing.status !== "SCHEDULED" && data.status && data.status !== existing.status) {
      throw ApiError.badRequest(`Cannot update session in "${existing.status}" status`);
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const session = await repository.update(id, data);
    const afterSnapshot = session as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "ClassSession",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    emitSessionUpdated({
      sessionId: id,
      courseOfferingId: (session as Record<string, unknown>).courseOfferingId as string,
      session: afterSnapshot,
    });

    return session as ClassSessionDetail;
  }

  static async startSession(
    id: string,
    ctx: AuditContext
  ): Promise<ClassSessionDetail> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Class session not found");
    }

    if (existing.status !== "SCHEDULED") {
      throw ApiError.badRequest(`Cannot start session in "${existing.status}" status`);
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const session = await repository.startSession(id);
    const afterSnapshot = session as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "ClassSession",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    const coId = (session as Record<string, unknown>).courseOfferingId as string;
    const offeringRecord = await this.resolveOfferingMeta(coId);

    emitSessionStarted({
      sessionId: id,
      courseOfferingId: coId,
      lecturerId: ctx.actorId,
      facultyId: offeringRecord?.facultyId ?? "",
      session: afterSnapshot,
    });

    return session as ClassSessionDetail;
  }

  static async closeSession(
    id: string,
    ctx: AuditContext
  ): Promise<ClassSessionDetail> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Class session not found");
    }

    if (existing.status !== "OPEN") {
      throw ApiError.badRequest(`Cannot close session in "${existing.status}" status`);
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const session = await repository.closeSession(id);
    const afterSnapshot = session as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "ClassSession",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    const coId = (session as Record<string, unknown>).courseOfferingId as string;
    const offeringRecord = await this.resolveOfferingMeta(coId);

    emitSessionClosed({
      sessionId: id,
      courseOfferingId: coId,
      lecturerId: ctx.actorId,
      facultyId: offeringRecord?.facultyId ?? "",
      session: afterSnapshot,
    });

    return session as ClassSessionDetail;
  }

  static async cancelSession(
    id: string,
    ctx: AuditContext
  ): Promise<ClassSessionDetail> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Class session not found");
    }

    if (existing.status === "CLOSED" || existing.status === "CANCELLED") {
      throw ApiError.badRequest(`Cannot cancel session in "${existing.status}" status`);
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const session = await repository.cancelSession(id);
    const afterSnapshot = session as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "ClassSession",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return session as ClassSessionDetail;
  }

  static async delete(
    id: string,
    ctx: AuditContext
  ): Promise<{ message: string }> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Class session not found");
    }

    if (existing.status === "OPEN") {
      throw ApiError.badRequest("Cannot delete an open session. Close it first.");
    }

    const attendanceCount = await repository.countAttendanceRecords(id);
    if (attendanceCount > 0) {
      throw ApiError.badRequest(
        `Cannot delete session with ${attendanceCount} attendance record(s). Remove them first.`
      );
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;

    await repository.delete(id);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.DELETE,
        entityType: "ClassSession",
        entityId: id,
        beforeJson: beforeSnapshot,
      },
      ctx
    );

    return { message: "Class session deleted successfully" };
  }

  private static async resolveOfferingMeta(offeringId: string): Promise<{ facultyId: string } | null> {
    try {
      const offering = await repository.resolveOffering(offeringId);
      return offering;
    } catch {
      return null;
    }
  }
}
