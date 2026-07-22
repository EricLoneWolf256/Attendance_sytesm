import { Request, Response } from "express";
import { DepartmentsService } from "./departments.service";
import { listDepartmentsQuerySchema } from "./departments.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuditContext } from "./departments.types";

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

export class DepartmentsController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const query = listDepartmentsQuerySchema.parse(req.query);
    const result = await DepartmentsService.list(query);
    ApiResponse.success(res, result);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const department = await DepartmentsService.getById(extractId(req));
    ApiResponse.success(res, { department });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const department = await DepartmentsService.create(req.body, ctx);
    ApiResponse.created(res, { department });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const department = await DepartmentsService.update(extractId(req), req.body, ctx);
    ApiResponse.success(res, { department });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const result = await DepartmentsService.delete(extractId(req), ctx);
    ApiResponse.success(res, result);
  });
}
