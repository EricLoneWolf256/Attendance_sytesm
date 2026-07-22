import { AuditAction } from "@prisma/client";
import { SemestersRepository } from "./semesters.repository";
import { CreateSemesterInput, UpdateSemesterInput, ListSemestersQuery } from "./semesters.validation";
import { PaginatedSemesters, AuditContext, SemesterDetail } from "./semesters.types";
import { ApiError } from "../../utils/ApiError";

const repository = new SemestersRepository();

export class SemestersService {
  static async list(query: ListSemestersQuery): Promise<PaginatedSemesters> {
    const { semesters, total } = await repository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      semesters,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }

  static async getById(id: string): Promise<SemesterDetail> {
    const semester = await repository.findById(id);
    if (!semester) {
      throw ApiError.notFound("Semester not found");
    }
    return semester as SemesterDetail;
  }

  static async create(
    data: CreateSemesterInput,
    ctx: AuditContext
  ): Promise<SemesterDetail> {
    const code = data.name.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").toLowerCase();
    const [existingName, existingCode] = await Promise.all([
      repository.findByNameAndYear(data.name, data.academicYearId),
      repository.findByCodeAndYear(code, data.academicYearId),
    ]);

    if (existingName) {
      throw ApiError.conflict(`Semester name "${data.name}" already exists for this academic year`);
    }
    if (existingCode) {
      throw ApiError.conflict("Semester code already exists for this academic year");
    }

    if (data.isActive) {
      await repository.unsetActiveSemesters();
    }

    const semester = await repository.create(data);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.CREATE,
        entityType: "Semester",
        entityId: semester.id,
        afterJson: semester as unknown as Record<string, unknown>,
      },
      ctx
    );

    return semester as SemesterDetail;
  }

  static async update(
    id: string,
    data: UpdateSemesterInput,
    ctx: AuditContext
  ): Promise<SemesterDetail> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Semester not found");
    }

    if (data.name && data.name !== existing.name) {
      const nameTaken = await repository.findByNameAndYear(data.name, existing.academicYearId);
      if (nameTaken) {
        throw ApiError.conflict(`Semester name "${data.name}" already exists for this academic year`);
      }
    }

    if (data.isActive) {
      await repository.unsetActiveSemesters();
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const semester = await repository.update(id, data);
    const afterSnapshot = semester as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "Semester",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return semester as SemesterDetail;
  }

  static async delete(
    id: string,
    ctx: AuditContext
  ): Promise<{ message: string }> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Semester not found");
    }

    const [offeringCount, sessionCount] = await Promise.all([
      repository.countCourseOfferings(id),
      repository.countClassSessions(id),
    ]);

    if (offeringCount > 0 || sessionCount > 0) {
      throw ApiError.badRequest(
        `Cannot delete semester with ${offeringCount} course offering(s) and ${sessionCount} class session(s). Remove them first.`
      );
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;

    await repository.softDelete(id);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.DELETE,
        entityType: "Semester",
        entityId: id,
        beforeJson: beforeSnapshot,
      },
      ctx
    );

    return { message: "Semester deleted successfully" };
  }
}
