import { z } from "zod";

export const studentAttendanceQuerySchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  courseOfferingId: z.string().optional(),
  semesterId: z.string().optional(),
  academicYearId: z.string().optional(),
});

export const courseAttendanceQuerySchema = z.object({
  courseOfferingId: z.string().min(1, "Course offering ID is required"),
});

export const sessionAttendanceQuerySchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export const facultyOverviewQuerySchema = z.object({
  facultyId: z.string().min(1, "Faculty ID is required"),
  academicYearId: z.string().optional(),
});

export const departmentOverviewQuerySchema = z.object({
  departmentId: z.string().min(1, "Department ID is required"),
  academicYearId: z.string().optional(),
});

export const attendanceTrendQuerySchema = z.object({
  courseOfferingId: z.string().optional(),
  programmeId: z.string().optional(),
  departmentId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type StudentAttendanceQuery = z.infer<typeof studentAttendanceQuerySchema>;
export type CourseAttendanceQuery = z.infer<typeof courseAttendanceQuerySchema>;
export type SessionAttendanceQuery = z.infer<typeof sessionAttendanceQuerySchema>;
export type FacultyOverviewQuery = z.infer<typeof facultyOverviewQuerySchema>;
export type DepartmentOverviewQuery = z.infer<typeof departmentOverviewQuerySchema>;
export type AttendanceTrendQuery = z.infer<typeof attendanceTrendQuerySchema>;
