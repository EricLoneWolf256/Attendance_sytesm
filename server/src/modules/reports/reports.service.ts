import { ReportsRepository } from "./reports.repository";
import {
  StudentAttendanceQuery,
  CourseAttendanceQuery,
  SessionAttendanceQuery,
  FacultyOverviewQuery,
  DepartmentOverviewQuery,
  AttendanceTrendQuery,
} from "./reports.validation";
import {
  StudentAttendanceSummary,
  CourseAttendanceSummary,
  SessionAttendanceDetail,
  FacultyAttendanceOverview,
  DepartmentAttendanceOverview,
  DailyAttendanceTrend,
} from "./reports.types";
import { ApiError } from "../../utils/ApiError";

const repository = new ReportsRepository();

export class ReportsService {
  static async getStudentAttendance(query: StudentAttendanceQuery): Promise<StudentAttendanceSummary[]> {
    return repository.getStudentAttendanceSummary(query);
  }

  static async getCourseAttendance(query: CourseAttendanceQuery): Promise<CourseAttendanceSummary> {
    const result = await repository.getCourseAttendanceSummary(query);
    return result;
  }

  static async getSessionAttendance(query: SessionAttendanceQuery): Promise<SessionAttendanceDetail> {
    try {
      return await repository.getSessionAttendanceDetail(query);
    } catch {
      throw ApiError.notFound("Session not found");
    }
  }

  static async getFacultyOverview(query: FacultyOverviewQuery): Promise<FacultyAttendanceOverview> {
    try {
      return await repository.getFacultyOverview(query);
    } catch {
      throw ApiError.notFound("Faculty not found");
    }
  }

  static async getDepartmentOverview(query: DepartmentOverviewQuery): Promise<DepartmentAttendanceOverview> {
    try {
      return await repository.getDepartmentOverview(query);
    } catch {
      throw ApiError.notFound("Department not found");
    }
  }

  static async getAttendanceTrend(query: AttendanceTrendQuery): Promise<DailyAttendanceTrend[]> {
    return repository.getAttendanceTrend(query);
  }
}
