import { AuditAction } from "@prisma/client";
import { EnrollmentsRepository } from "./enrollments.repository";
import { CreateEnrollmentInput, BulkCreateEnrollmentInput, UpdateEnrollmentInput, ListEnrollmentsQuery } from "./enrollments.validation";
import { PaginatedEnrollments, AuditContext, EnrollmentDetail } from "./enrollments.types";
import { ApiError } from "../../utils/ApiError";

const repository = new EnrollmentsRepository();

export class EnrollmentsService {
  static async list(query: ListEnrollmentsQuery): Promise<PaginatedEnrollments> {
    const { enrollments, total } = await repository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      enrollments,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }

  static async getById(id: string): Promise<EnrollmentDetail> {
    const enrollment = await repository.findById(id);
    if (!enrollment) {
      throw ApiError.notFound("Enrollment not found");
    }
    return enrollment as EnrollmentDetail;
  }

  static async create(
    data: CreateEnrollmentInput,
    ctx: AuditContext
  ): Promise<EnrollmentDetail> {
    const existing = await repository.findExistingEnrollment(data.studentId, data.courseOfferingId);
    if (existing) {
      if (existing.status === "ENROLLED") {
        throw ApiError.conflict("Student is already enrolled in this course offering");
      }
    }

    const enrollment = await repository.create(data);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.CREATE,
        entityType: "Enrollment",
        entityId: enrollment.id,
        afterJson: enrollment as unknown as Record<string, unknown>,
      },
      ctx
    );

    return enrollment as EnrollmentDetail;
  }

  static async bulkCreate(
    data: BulkCreateEnrollmentInput,
    ctx: AuditContext
  ): Promise<{ enrolled: number; skipped: number }> {
    const pairs = data.studentIds.map((studentId) => ({
      studentId,
      courseOfferingId: data.courseOfferingId,
    }));

    const count = await repository.createMany(pairs);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.CREATE,
        entityType: "Enrollment",
        entityId: data.courseOfferingId,
        afterJson: { bulkEnroll: true, studentIds: data.studentIds, enrolled: count } as unknown as Record<string, unknown>,
      },
      ctx
    );

    return { enrolled: count, skipped: pairs.length - count };
  }

  static async update(
    id: string,
    data: UpdateEnrollmentInput,
    ctx: AuditContext
  ): Promise<EnrollmentDetail> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Enrollment not found");
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const enrollment = await repository.update(id, data);
    const afterSnapshot = enrollment as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "Enrollment",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return enrollment as EnrollmentDetail;
  }

  static async delete(
    id: string,
    ctx: AuditContext
  ): Promise<{ message: string }> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Enrollment not found");
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;

    await repository.delete(id);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.DELETE,
        entityType: "Enrollment",
        entityId: id,
        beforeJson: beforeSnapshot,
      },
      ctx
    );

    return { message: "Enrollment deleted successfully" };
  }
}
