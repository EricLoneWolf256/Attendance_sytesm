import { Request, Response } from "express";
import { UsersService } from "./users.service";
import { listUsersQuerySchema } from "./users.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuditContext } from "./users.types";

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

export class UsersController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const query = listUsersQuerySchema.parse(req.query);
    const result = await UsersService.list(query);
    ApiResponse.success(res, result);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const user = await UsersService.getById(extractId(req));
    ApiResponse.success(res, { user });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const user = await UsersService.create(req.body, ctx);
    ApiResponse.created(res, { user });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const user = await UsersService.update(extractId(req), req.body, ctx);
    ApiResponse.success(res, { user });
  });

  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const user = await UsersService.updateStatus(extractId(req), req.body, ctx);
    ApiResponse.success(res, { user });
  });

  static updateRole = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const user = await UsersService.updateRole(extractId(req), req.body, ctx);
    ApiResponse.success(res, { user });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const result = await UsersService.delete(extractId(req), ctx);
    ApiResponse.success(res, result);
  });
}
