import { Request, Response } from "express";
import { FacultiesService } from "./faculties.service";
import { listFacultiesQuerySchema } from "./faculties.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuditContext } from "./faculties.types";

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

export class FacultiesController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const query = listFacultiesQuerySchema.parse(req.query);
    const result = await FacultiesService.list(query);
    ApiResponse.success(res, result);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const faculty = await FacultiesService.getById(extractId(req));
    ApiResponse.success(res, { faculty });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const faculty = await FacultiesService.create(req.body, ctx);
    ApiResponse.created(res, { faculty });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const faculty = await FacultiesService.update(extractId(req), req.body, ctx);
    ApiResponse.success(res, { faculty });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const result = await FacultiesService.delete(extractId(req), ctx);
    ApiResponse.success(res, result);
  });
}
