import { Request, Response } from "express";
import { ReportsService } from "./reports.service";
import {
  studentAttendanceQuerySchema,
  courseAttendanceQuerySchema,
  sessionAttendanceQuerySchema,
  facultyOverviewQuerySchema,
  departmentOverviewQuerySchema,
  attendanceTrendQuerySchema,
} from "./reports.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";

export class ReportsController {
  static getStudentAttendance = asyncHandler(async (req: Request, res: Response) => {
    const query = studentAttendanceQuerySchema.parse(req.query);
    const result = await ReportsService.getStudentAttendance(query);
    ApiResponse.success(res, { reports: result });
  });

  static getCourseAttendance = asyncHandler(async (req: Request, res: Response) => {
    const query = courseAttendanceQuerySchema.parse(req.query);
    const result = await ReportsService.getCourseAttendance(query);
    ApiResponse.success(res, { report: result });
  });

  static getSessionAttendance = asyncHandler(async (req: Request, res: Response) => {
    const query = sessionAttendanceQuerySchema.parse(req.query);
    const result = await ReportsService.getSessionAttendance(query);
    ApiResponse.success(res, { report: result });
  });

  static getFacultyOverview = asyncHandler(async (req: Request, res: Response) => {
    const query = facultyOverviewQuerySchema.parse(req.query);
    const result = await ReportsService.getFacultyOverview(query);
    ApiResponse.success(res, { report: result });
  });

  static getDepartmentOverview = asyncHandler(async (req: Request, res: Response) => {
    const query = departmentOverviewQuerySchema.parse(req.query);
    const result = await ReportsService.getDepartmentOverview(query);
    ApiResponse.success(res, { report: result });
  });

  static getAttendanceTrend = asyncHandler(async (req: Request, res: Response) => {
    const query = attendanceTrendQuerySchema.parse(req.query);
    const result = await ReportsService.getAttendanceTrend(query);
    ApiResponse.success(res, { trend: result });
  });
}
