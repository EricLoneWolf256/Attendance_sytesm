import { Request, Response } from "express";
import { ClassSessionsService } from "./class-sessions.service";
import { listClassSessionsQuerySchema } from "./class-sessions.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuditContext } from "./class-sessions.types";

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

export class ClassSessionsController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const query = listClassSessionsQuerySchema.parse(req.query);
    const result = await ClassSessionsService.list(query);
    ApiResponse.success(res, result);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const session = await ClassSessionsService.getById(extractId(req));
    ApiResponse.success(res, { classSession: session });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const session = await ClassSessionsService.create(req.body, ctx);
    ApiResponse.created(res, { classSession: session });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const session = await ClassSessionsService.update(extractId(req), req.body, ctx);
    ApiResponse.success(res, { classSession: session });
  });

  static startSession = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const session = await ClassSessionsService.startSession(extractId(req), ctx);
    ApiResponse.success(res, { classSession: session });
  });

  static closeSession = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const session = await ClassSessionsService.closeSession(extractId(req), ctx);
    ApiResponse.success(res, { classSession: session });
  });

  static cancelSession = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const session = await ClassSessionsService.cancelSession(extractId(req), ctx);
    ApiResponse.success(res, { classSession: session });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const result = await ClassSessionsService.delete(extractId(req), ctx);
    ApiResponse.success(res, result);
  });
}
