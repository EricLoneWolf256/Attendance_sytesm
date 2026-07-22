import { Request, Response } from "express";
import { SemestersService } from "./semesters.service";
import { listSemestersQuerySchema } from "./semesters.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuditContext } from "./semesters.types";

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

export class SemestersController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const query = listSemestersQuerySchema.parse(req.query);
    const result = await SemestersService.list(query);
    ApiResponse.success(res, result);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const semester = await SemestersService.getById(extractId(req));
    ApiResponse.success(res, { semester });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const semester = await SemestersService.create(req.body, ctx);
    ApiResponse.created(res, { semester });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const semester = await SemestersService.update(extractId(req), req.body, ctx);
    ApiResponse.success(res, { semester });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const result = await SemestersService.delete(extractId(req), ctx);
    ApiResponse.success(res, result);
  });
}
