import { Request, Response } from "express";
import { CourseOfferingsService } from "./course-offerings.service";
import { listCourseOfferingsQuerySchema } from "./course-offerings.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuditContext } from "./course-offerings.types";

function buildAuditContext(req: Request): AuditContext {
  return {
    actorId: req.user!.userId,
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
  };
}

function extractId(req: Request): string {
  return req.params.id as string;
}

export class CourseOfferingsController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const query = listCourseOfferingsQuerySchema.parse(req.query);
    const result = await CourseOfferingsService.list(query);
    ApiResponse.success(res, result);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const offering = await CourseOfferingsService.getById(extractId(req));
    ApiResponse.success(res, { courseOffering: offering });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const offering = await CourseOfferingsService.create(req.body, ctx);
    ApiResponse.created(res, { courseOffering: offering });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const offering = await CourseOfferingsService.update(extractId(req), req.body, ctx);
    ApiResponse.success(res, { courseOffering: offering });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const result = await CourseOfferingsService.delete(extractId(req), ctx);
    ApiResponse.success(res, result);
  });
}
