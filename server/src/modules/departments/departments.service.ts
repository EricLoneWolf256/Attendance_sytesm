import { AuditAction } from "@prisma/client";
import { DepartmentsRepository } from "./departments.repository";
import { CreateDepartmentInput, UpdateDepartmentInput, ListDepartmentsQuery } from "./departments.validation";
import { PaginatedDepartments, AuditContext, DepartmentDetail } from "./departments.types";
import { ApiError } from "../../utils/ApiError";

const repository = new DepartmentsRepository();

export class DepartmentsService {
  static async list(query: ListDepartmentsQuery): Promise<PaginatedDepartments> {
    const { departments, total } = await repository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      departments,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }

  static async getById(id: string): Promise<DepartmentDetail> {
    const department = await repository.findById(id);
    if (!department) {
      throw ApiError.notFound("Department not found");
    }
    return department as DepartmentDetail;
  }

  static async create(
    data: CreateDepartmentInput,
    ctx: AuditContext
  ): Promise<DepartmentDetail> {
    const [existingName, existingCode] = await Promise.all([
      repository.findByNameAndFaculty(data.name, data.facultyId),
      repository.findByCodeAndFaculty(data.code, data.facultyId),
    ]);

    if (existingName) {
      throw ApiError.conflict(`Department name "${data.name}" already exists in this faculty`);
    }
    if (existingCode) {
      throw ApiError.conflict(`Department code "${data.code}" already exists in this faculty`);
    }

    const department = await repository.create(data);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.CREATE,
        entityType: "Department",
        entityId: department.id,
        afterJson: department as unknown as Record<string, unknown>,
      },
      ctx
    );

    return department as DepartmentDetail;
  }

  static async update(
    id: string,
    data: UpdateDepartmentInput,
    ctx: AuditContext
  ): Promise<DepartmentDetail> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Department not found");
    }

    const targetFacultyId = data.facultyId ?? existing.facultyId;

    if (data.name && data.name !== existing.name) {
      const nameTaken = await repository.findByNameAndFaculty(data.name, targetFacultyId);
      if (nameTaken) {
        throw ApiError.conflict(`Department name "${data.name}" already exists in this faculty`);
      }
    }

    if (data.code && data.code !== existing.code) {
      const codeTaken = await repository.findByCodeAndFaculty(data.code, targetFacultyId);
      if (codeTaken) {
        throw ApiError.conflict(`Department code "${data.code}" already exists in this faculty`);
      }
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const department = await repository.update(id, data);
    const afterSnapshot = department as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "Department",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return department as DepartmentDetail;
  }

  static async delete(
    id: string,
    ctx: AuditContext
  ): Promise<{ message: string }> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Department not found");
    }

    if (!existing.isActive) {
      throw ApiError.badRequest("Department is already deactivated");
    }

    const [programmeCount, courseCount] = await Promise.all([
      repository.countProgrammes(id),
      repository.countCourses(id),
    ]);

    if (programmeCount > 0 || courseCount > 0) {
      throw ApiError.badRequest(
        `Cannot deactivate department with ${programmeCount} programme(s) and ${courseCount} course(s). Remove them first.`
      );
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const department = await repository.softDelete(id);
    const afterSnapshot = department as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.DELETE,
        entityType: "Department",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return { message: "Department deactivated successfully" };
  }
}
