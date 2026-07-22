import { Request, Response } from "express";
import { AttendanceService } from "./attendance.service";
import { listAttendanceQuerySchema } from "./attendance.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuditContext } from "./attendance.types";

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

export class AttendanceController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const query = listAttendanceQuerySchema.parse(req.query);
    const result = await AttendanceService.list(query);
    ApiResponse.success(res, result);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const record = await AttendanceService.getById(extractId(req));
    ApiResponse.success(res, { attendanceRecord: record });
  });

  static markAttendance = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const record = await AttendanceService.markAttendance(req.body, ctx);
    ApiResponse.created(res, { attendanceRecord: record });
  });

  static bulkMarkAttendance = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const result = await AttendanceService.bulkMarkAttendance(req.body, ctx);
    ApiResponse.created(res, result);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const record = await AttendanceService.update(extractId(req), req.body, ctx);
    ApiResponse.success(res, { attendanceRecord: record });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const ctx = buildAuditContext(req);
    const result = await AttendanceService.delete(extractId(req), ctx);
    ApiResponse.success(res, result);
  });

  static getSessionStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await AttendanceService.getSessionStats(req.params.sessionId as string);
    ApiResponse.success(res, { stats });
  });
}
