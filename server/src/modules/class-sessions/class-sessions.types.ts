export interface ClassSessionListItem {
  id: string;
  courseOfferingId: string;
  semesterId: string | null;
  venueId: string | null;
  startedBy: string;
  date: Date;
  modeOfTeaching: string;
  startTime: Date;
  endTime: Date | null;
  actualStartTime: Date | null;
  actualEndTime: Date | null;
  duration: number | null;
  topic: string | null;
  materials: string | null;
  status: string;
  maxCheckInTime: Date | null;
  lecturerConfirmedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  courseOffering: {
    id: string;
    course: { code: string; title: string };
    programme: { name: string; code: string };
    semester: { name: string; code: string };
  };
  venue: { id: string; name: string; code: string; capacity: number } | null;
  starter: { id: string; firstName: string; lastName: string; email: string };
  _count: { attendanceRecords: number };
}

export interface ClassSessionDetail extends ClassSessionListItem {
  attendanceRecords: {
    id: string;
    studentId: string;
    status: string;
    signedInAt: Date | null;
    signInMethod: string | null;
    student: { id: string; firstName: string; lastName: string; email: string; studentNumber: string | null };
  }[];
}

export interface PaginatedClassSessions {
  classSessions: ClassSessionListItem[];
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
