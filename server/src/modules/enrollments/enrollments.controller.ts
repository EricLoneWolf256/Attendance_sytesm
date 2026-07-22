import { Request, Response } from "express";
import { EnrollmentsService } from "./enrollments.service";
import { listEnrollmentsQuerySchema } from "./enrollments.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuditContext } from "./enrollments.types";

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

export class EnrollmentsController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const query = listEnrollmentsQuerySchema.parse(req.query);
    const result = await EnrollmentsService.list(query);
    ApiResponse.success(res, result);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const enrollment = await EnrollmentsService.getById(extractId(req));
    ApiResponse.success(res, { enrollment });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const enrollment = await EnrollmentsService.create(req.body, ctx);
    ApiResponse.created(res, { enrollment });
  });

  static bulkCreate = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const result = await EnrollmentsService.bulkCreate(req.body, ctx);
    ApiResponse.created(res, result);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const enrollment = await EnrollmentsService.update(extractId(req), req.body, ctx);
    ApiResponse.success(res, { enrollment });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const result = await EnrollmentsService.delete(extractId(req), ctx);
    ApiResponse.success(res, result);
  });
}
