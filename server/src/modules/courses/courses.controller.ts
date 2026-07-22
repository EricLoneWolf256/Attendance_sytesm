import { Request, Response } from "express";
import { CoursesService } from "./courses.service";
import { listCoursesQuerySchema } from "./courses.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuditContext } from "./courses.types";

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

export class CoursesController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const query = listCoursesQuerySchema.parse(req.query);
    const result = await CoursesService.list(query);
    ApiResponse.success(res, result);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const course = await CoursesService.getById(extractId(req));
    ApiResponse.success(res, { course });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const course = await CoursesService.create(req.body, ctx);
    ApiResponse.created(res, { course });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const course = await CoursesService.update(extractId(req), req.body, ctx);
    ApiResponse.success(res, { course });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const result = await CoursesService.delete(extractId(req), ctx);
    ApiResponse.success(res, result);
  });
}
