import { AuditAction } from "@prisma/client";
import { FacultiesRepository } from "./faculties.repository";
import { CreateFacultyInput, UpdateFacultyInput, ListFacultiesQuery } from "./faculties.validation";
import { PaginatedFaculties, AuditContext, FacultyDetail } from "./faculties.types";
import { ApiError } from "../../utils/ApiError";

const repository = new FacultiesRepository();

export class FacultiesService {
  static async list(query: ListFacultiesQuery): Promise<PaginatedFaculties> {
    const { faculties, total } = await repository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      faculties,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }

  static async getById(id: string): Promise<FacultyDetail> {
    const faculty = await repository.findById(id);
    if (!faculty) {
      throw ApiError.notFound("Faculty not found");
    }
    return faculty as FacultyDetail;
  }

  static async create(
    data: CreateFacultyInput,
    ctx: AuditContext
  ): Promise<FacultyDetail> {
    const [existingName, existingCode] = await Promise.all([
      repository.findByName(data.name),
      repository.findByCode(data.code),
    ]);

    if (existingName) {
      throw ApiError.conflict(`Faculty name "${data.name}" already exists`);
    }
    if (existingCode) {
      throw ApiError.conflict(`Faculty code "${data.code}" already exists`);
    }

    const faculty = await repository.create(data);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.CREATE,
        entityType: "Faculty",
        entityId: faculty.id,
        afterJson: faculty as unknown as Record<string, unknown>,
      },
      ctx
    );

    return faculty as FacultyDetail;
  }

  static async update(
    id: string,
    data: UpdateFacultyInput,
    ctx: AuditContext
  ): Promise<FacultyDetail> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Faculty not found");
    }

    if (data.name && data.name !== existing.name) {
      const nameTaken = await repository.findByName(data.name);
      if (nameTaken) {
        throw ApiError.conflict(`Faculty name "${data.name}" already exists`);
      }
    }

    if (data.code && data.code !== existing.code) {
      const codeTaken = await repository.findByCode(data.code);
      if (codeTaken) {
        throw ApiError.conflict(`Faculty code "${data.code}" already exists`);
      }
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const faculty = await repository.update(id, data);
    const afterSnapshot = faculty as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "Faculty",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return faculty as FacultyDetail;
  }

  static async delete(
    id: string,
    ctx: AuditContext
  ): Promise<{ message: string }> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Faculty not found");
    }

    if (!existing.isActive) {
      throw ApiError.badRequest("Faculty is already deactivated");
    }

    const departmentCount = await repository.countDepartments(id);
    if (departmentCount > 0) {
      throw ApiError.badRequest(
        `Cannot deactivate faculty with ${departmentCount} active department(s). Remove departments first.`
      );
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const faculty = await repository.softDelete(id);
    const afterSnapshot = faculty as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.DELETE,
        entityType: "Faculty",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return { message: "Faculty deactivated successfully" };
  }
}
