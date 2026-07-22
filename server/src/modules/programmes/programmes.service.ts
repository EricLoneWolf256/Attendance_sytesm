import { AuditAction } from "@prisma/client";
import { ProgrammesRepository } from "./programmes.repository";
import { CreateProgrammeInput, UpdateProgrammeInput, ListProgrammesQuery } from "./programmes.validation";
import { PaginatedProgrammes, AuditContext, ProgrammeDetail } from "./programmes.types";
import { ApiError } from "../../utils/ApiError";

const repository = new ProgrammesRepository();

export class ProgrammesService {
  static async list(query: ListProgrammesQuery): Promise<PaginatedProgrammes> {
    const { programmes, total } = await repository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      programmes,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }

  static async getById(id: string): Promise<ProgrammeDetail> {
    const programme = await repository.findById(id);
    if (!programme) {
      throw ApiError.notFound("Programme not found");
    }
    return programme as unknown as ProgrammeDetail;
  }

  static async create(
    data: CreateProgrammeInput,
    ctx: AuditContext
  ): Promise<ProgrammeDetail> {
    const [existingName, existingCode] = await Promise.all([
      repository.findByNameAndDepartment(data.name, data.departmentId),
      repository.findByCodeAndDepartment(data.code, data.departmentId),
    ]);

    if (existingName) {
      throw ApiError.conflict(`Programme name "${data.name}" already exists in this department`);
    }
    if (existingCode) {
      throw ApiError.conflict(`Programme code "${data.code}" already exists in this department`);
    }

    const programme = await repository.create(data);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.CREATE,
        entityType: "Programme",
        entityId: programme.id,
        afterJson: programme as unknown as Record<string, unknown>,
      },
      ctx
    );

    return programme as unknown as ProgrammeDetail;
  }

  static async update(
    id: string,
    data: UpdateProgrammeInput,
    ctx: AuditContext
  ): Promise<ProgrammeDetail> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Programme not found");
    }

    const targetDepartmentId = data.departmentId ?? existing.departmentId;

    if (data.name && data.name !== existing.name) {
      const nameTaken = await repository.findByNameAndDepartment(data.name, targetDepartmentId);
      if (nameTaken) {
        throw ApiError.conflict(`Programme name "${data.name}" already exists in this department`);
      }
    }

    if (data.code && data.code !== existing.code) {
      const codeTaken = await repository.findByCodeAndDepartment(data.code, targetDepartmentId);
      if (codeTaken) {
        throw ApiError.conflict(`Programme code "${data.code}" already exists in this department`);
      }
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const programme = await repository.update(id, data);
    const afterSnapshot = programme as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "Programme",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return programme as unknown as ProgrammeDetail;
  }

  static async delete(
    id: string,
    ctx: AuditContext
  ): Promise<{ message: string }> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Programme not found");
    }

    if (!existing.isActive) {
      throw ApiError.badRequest("Programme is already deactivated");
    }

    const offeringCount = await repository.countCourseOfferings(id);
    if (offeringCount > 0) {
      throw ApiError.badRequest(
        `Cannot deactivate programme with ${offeringCount} course offering(s). Remove them first.`
      );
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const programme = await repository.softDelete(id);
    const afterSnapshot = programme as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.DELETE,
        entityType: "Programme",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return { message: "Programme deactivated successfully" };
  }
}
