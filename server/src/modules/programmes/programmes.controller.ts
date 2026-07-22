import { Request, Response } from "express";
import { ProgrammesService } from "./programmes.service";
import { listProgrammesQuerySchema } from "./programmes.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuditContext } from "./programmes.types";

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

export class ProgrammesController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const query = listProgrammesQuerySchema.parse(req.query);
    const result = await ProgrammesService.list(query);
    ApiResponse.success(res, result);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const programme = await ProgrammesService.getById(extractId(req));
    ApiResponse.success(res, { programme });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const programme = await ProgrammesService.create(req.body, ctx);
    ApiResponse.created(res, { programme });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const programme = await ProgrammesService.update(extractId(req), req.body, ctx);
    ApiResponse.success(res, { programme });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const result = await ProgrammesService.delete(extractId(req), ctx);
    ApiResponse.success(res, result);
  });
}
