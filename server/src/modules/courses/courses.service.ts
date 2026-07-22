import { AuditAction } from "@prisma/client";
import { CoursesRepository } from "./courses.repository";
import { CreateCourseInput, UpdateCourseInput, ListCoursesQuery } from "./courses.validation";
import { PaginatedCourses, AuditContext, CourseDetail } from "./courses.types";
import { ApiError } from "../../utils/ApiError";

const repository = new CoursesRepository();

export class CoursesService {
  static async list(query: ListCoursesQuery): Promise<PaginatedCourses> {
    const { courses, total } = await repository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      courses,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }

  static async getById(id: string): Promise<CourseDetail> {
    const course = await repository.findById(id);
    if (!course) {
      throw ApiError.notFound("Course not found");
    }
    return course as CourseDetail;
  }

  static async create(
    data: CreateCourseInput,
    ctx: AuditContext
  ): Promise<CourseDetail> {
    const existingCode = await repository.findByCode(data.code);
    if (existingCode) {
      throw ApiError.conflict(`Course code "${data.code}" already exists`);
    }

    const course = await repository.create(data);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.CREATE,
        entityType: "Course",
        entityId: course.id,
        afterJson: course as unknown as Record<string, unknown>,
      },
      ctx
    );

    return course as CourseDetail;
  }

  static async update(
    id: string,
    data: UpdateCourseInput,
    ctx: AuditContext
  ): Promise<CourseDetail> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Course not found");
    }

    if (data.code && data.code !== existing.code) {
      const codeTaken = await repository.findByCode(data.code);
      if (codeTaken) {
        throw ApiError.conflict(`Course code "${data.code}" already exists`);
      }
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const course = await repository.update(id, data);
    const afterSnapshot = course as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "Course",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return course as CourseDetail;
  }

  static async delete(
    id: string,
    ctx: AuditContext
  ): Promise<{ message: string }> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Course not found");
    }

    if (!existing.isActive) {
      throw ApiError.badRequest("Course is already deactivated");
    }

    const offeringCount = await repository.countCourseOfferings(id);
    if (offeringCount > 0) {
      throw ApiError.badRequest(
        `Cannot deactivate course with ${offeringCount} active course offering(s). Remove offerings first.`
      );
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const course = await repository.softDelete(id);
    const afterSnapshot = course as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.DELETE,
        entityType: "Course",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return { message: "Course deactivated successfully" };
  }
}
