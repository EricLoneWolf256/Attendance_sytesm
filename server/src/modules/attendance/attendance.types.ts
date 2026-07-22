export interface AttendanceRecordListItem {
  id: string;
  sessionId: string;
  studentId: string;
  status: string;
  signedInAt: Date | null;
  signInMethod: string;
  deviceFingerprint: string | null;
  student: { id: string; firstName: string; lastName: string; email: string; studentNumber: string | null };
}

export type AttendanceRecordDetail = AttendanceRecordListItem;

export interface PaginatedAttendanceRecords {
  attendanceRecords: AttendanceRecordListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
}
