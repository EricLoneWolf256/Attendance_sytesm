export type AttendanceStatusEnum = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
export type SignInMethodEnum = "QR" | "PIN" | "SELF" | "ADMIN_OVERRIDE";
export type EnrollmentStatusEnum =
  | "ENROLLED"
  | "DROPPED"
  | "COMPLETED"
  | "WITHDRAWN";

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatusEnum;
  signedInAt: Date | null;
  signInMethod: SignInMethodEnum;
  deviceFingerprint: string | null;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    studentNumber: string | null;
  };
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseOfferingId: string;
  classGroupId: string | null;
  status: EnrollmentStatusEnum;
  enrolledAt: Date;
  droppedAt: Date | null;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    studentNumber: string | null;
  };
  courseOffering?: {
    id: string;
    course: { code: string; title: string };
    programme: { name: string; code: string };
    yearOfStudy: number;
  };
  classGroup?: { id: string; name: string } | null;
}

export interface PaginatedEnrollments {
  enrollments: Enrollment[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface PaginatedAttendance {
  attendanceRecords: AttendanceRecord[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface SessionStats {
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
}
