export interface StudentAttendanceSummary {
  student: { id: string; firstName: string; lastName: string; email: string; studentNumber: string | null };
  totalSessions: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  attendancePercentage: number;
}

export interface CourseAttendanceSummary {
  courseOffering: { id: string; course: { code: string; title: string }; programme: { name: string; code: string }; yearOfStudy: number };
  totalSessions: number;
  totalEnrolled: number;
  averageAttendance: number;
  attendanceBySession: { sessionId: string; date: Date; topic: string | null; present: number; late: number; absent: number; excused: number; total: number }[];
}

export interface SessionAttendanceDetail {
  session: { id: string; date: Date; topic: string | null; status: string; modeOfTeaching: string };
  totalEnrolled: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  attendancePercentage: number;
  records: { studentId: string; firstName: string; lastName: string; email: string; studentNumber: string | null; status: string; signedInAt: Date | null; signInMethod: string | null }[];
}

export interface FacultyAttendanceOverview {
  faculty: { id: string; name: string; code: string };
  totalDepartments: number;
  totalProgrammes: number;
  totalCourses: number;
  totalSessions: number;
  averageAttendance: number;
}

export interface DepartmentAttendanceOverview {
  department: { id: string; name: string; code: string };
  totalProgrammes: number;
  totalCourses: number;
  totalSessions: number;
  averageAttendance: number;
}

export interface DailyAttendanceTrend {
  date: string;
  totalSessions: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  attendancePercentage: number;
}

export interface AuditContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
}
