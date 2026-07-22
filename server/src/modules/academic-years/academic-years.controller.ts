import { Request, Response } from "express";
import { AcademicYearsService } from "./academic-years.service";
import { listAcademicYearsQuerySchema } from "./academic-years.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuditContext } from "./academic-years.types";

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

export class AcademicYearsController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const query = listAcademicYearsQuerySchema.parse(req.query);
    const result = await AcademicYearsService.list(query);
    ApiResponse.success(res, result);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const academicYear = await AcademicYearsService.getById(extractId(req));
    ApiResponse.success(res, { academicYear });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const academicYear = await AcademicYearsService.create(req.body, ctx);
    ApiResponse.created(res, { academicYear });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const academicYear = await AcademicYearsService.update(extractId(req), req.body, ctx);
    ApiResponse.success(res, { academicYear });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const result = await AcademicYearsService.delete(extractId(req), ctx);
    ApiResponse.success(res, result);
  });
}
