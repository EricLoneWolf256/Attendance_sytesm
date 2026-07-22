import { AuditAction } from "@prisma/client";
import { AcademicYearsRepository } from "./academic-years.repository";
import { CreateAcademicYearInput, UpdateAcademicYearInput, ListAcademicYearsQuery } from "./academic-years.validation";
import { PaginatedAcademicYears, AuditContext, AcademicYearDetail } from "./academic-years.types";
import { ApiError } from "../../utils/ApiError";

const repository = new AcademicYearsRepository();

export class AcademicYearsService {
  static async list(query: ListAcademicYearsQuery): Promise<PaginatedAcademicYears> {
    const { academicYears, total } = await repository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      academicYears,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }

  static async getById(id: string): Promise<AcademicYearDetail> {
    const academicYear = await repository.findById(id);
    if (!academicYear) {
      throw ApiError.notFound("Academic year not found");
    }
    return academicYear as unknown as AcademicYearDetail;
  }

  static async create(
    data: CreateAcademicYearInput,
    ctx: AuditContext
  ): Promise<AcademicYearDetail> {
    const [existingLabel, existingCode] = await Promise.all([
      repository.findByLabel(data.label),
      repository.findByCode(data.label.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").toLowerCase()),
    ]);

    if (existingLabel) {
      throw ApiError.conflict(`Academic year label "${data.label}" already exists`);
    }
    if (existingCode) {
      throw ApiError.conflict("Academic year code already exists");
    }

    if (data.isCurrent) {
      await repository.unsetCurrentYears();
    }

    const academicYear = await repository.create(data);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.CREATE,
        entityType: "AcademicYear",
        entityId: academicYear.id,
        afterJson: academicYear as unknown as Record<string, unknown>,
      },
      ctx
    );

    return academicYear as unknown as AcademicYearDetail;
  }

  static async update(
    id: string,
    data: UpdateAcademicYearInput,
    ctx: AuditContext
  ): Promise<AcademicYearDetail> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Academic year not found");
    }

    if (data.label && data.label !== existing.label) {
      const labelTaken = await repository.findByLabel(data.label);
      if (labelTaken) {
        throw ApiError.conflict(`Academic year label "${data.label}" already exists`);
      }
      const newCode = data.label.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").toLowerCase();
      const codeTaken = await repository.findByCode(newCode);
      if (codeTaken) {
        throw ApiError.conflict("Academic year code already exists");
      }
    }

    if (data.isCurrent) {
      await repository.unsetCurrentYears();
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const academicYear = await repository.update(id, data);
    const afterSnapshot = academicYear as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "AcademicYear",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return academicYear as unknown as AcademicYearDetail;
  }

  static async delete(
    id: string,
    ctx: AuditContext
  ): Promise<{ message: string }> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Academic year not found");
    }

    const [semesterCount, offeringCount] = await Promise.all([
      repository.countSemesters(id),
      repository.countCourseOfferings(id),
    ]);

    if (semesterCount > 0 || offeringCount > 0) {
      throw ApiError.badRequest(
        `Cannot delete academic year with ${semesterCount} semester(s) and ${offeringCount} course offering(s). Remove them first.`
      );
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;

    await repository.delete(id);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.DELETE,
        entityType: "AcademicYear",
        entityId: id,
        beforeJson: beforeSnapshot,
      },
      ctx
    );

    return { message: "Academic year deleted successfully" };
  }
}
