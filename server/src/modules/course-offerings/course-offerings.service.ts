import { AuditAction } from "@prisma/client";
import { CourseOfferingsRepository } from "./course-offerings.repository";
import { CreateCourseOfferingInput, UpdateCourseOfferingInput, ListCourseOfferingsQuery } from "./course-offerings.validation";
import { PaginatedCourseOfferings, AuditContext, CourseOfferingDetail } from "./course-offerings.types";
import { ApiError } from "../../utils/ApiError";

const repository = new CourseOfferingsRepository();

export class CourseOfferingsService {
  static async list(query: ListCourseOfferingsQuery): Promise<PaginatedCourseOfferings> {
    const { courseOfferings, total } = await repository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      courseOfferings,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }

  static async getById(id: string): Promise<CourseOfferingDetail> {
    const offering = await repository.findById(id);
    if (!offering) {
      throw ApiError.notFound("Course offering not found");
    }
    return offering as CourseOfferingDetail;
  }

  static async create(
    data: CreateCourseOfferingInput,
    ctx: AuditContext
  ): Promise<CourseOfferingDetail> {
    const existing = await repository.findExistingOffering(
      data.courseId,
      data.programmeId,
      data.yearOfStudy,
      data.semesterId
    );

    if (existing) {
      throw ApiError.conflict(
        "A course offering already exists for this course, programme, year of study, and semester"
      );
    }

    const offering = await repository.create(data);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.CREATE,
        entityType: "CourseOffering",
        entityId: offering.id,
        afterJson: offering as unknown as Record<string, unknown>,
      },
      ctx
    );

    return offering as CourseOfferingDetail;
  }

  static async update(
    id: string,
    data: UpdateCourseOfferingInput,
    ctx: AuditContext
  ): Promise<CourseOfferingDetail> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Course offering not found");
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const offering = await repository.update(id, data);
    const afterSnapshot = offering as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "CourseOffering",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return offering as CourseOfferingDetail;
  }

  static async delete(
    id: string,
    ctx: AuditContext
  ): Promise<{ message: string }> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Course offering not found");
    }

    if (!existing.isActive) {
      throw ApiError.badRequest("Course offering is already deactivated");
    }

    const [enrollmentCount, sessionCount] = await Promise.all([
      repository.countEnrollments(id),
      repository.countSessions(id),
    ]);

    if (enrollmentCount > 0 || sessionCount > 0) {
      throw ApiError.badRequest(
        `Cannot deactivate offering with ${enrollmentCount} enrollment(s) and ${sessionCount} session(s). Remove them first.`
      );
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;

    await repository.softDelete(id);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.DELETE,
        entityType: "CourseOffering",
        entityId: id,
        beforeJson: beforeSnapshot,
      },
      ctx
    );

    return { message: "Course offering deactivated successfully" };
  }
}
