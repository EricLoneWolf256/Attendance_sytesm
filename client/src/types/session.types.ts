export type SessionMode = "ONLINE" | "PHYSICAL" | "HYBRID";
export type SessionStatus = "SCHEDULED" | "OPEN" | "CLOSED" | "CANCELLED";

export interface ClassSession {
  id: string;
  courseOfferingId: string;
  semesterId: string | null;
  venueId: string | null;
  startedBy: string;
  date: Date;
  modeOfTeaching: SessionMode;
  startTime: Date;
  endTime: Date | null;
  actualStartTime: Date | null;
  actualEndTime: Date | null;
  duration: number | null;
  topic: string | null;
  materials: string | null;
  status: SessionStatus;
  maxCheckInTime: Date | null;
  lecturerConfirmedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  courseOffering?: {
    id: string;
    course: { code: string; title: string };
    programme: { name: string; code: string };
    semester: { name: string; code: string };
  };
  venue?: { id: string; name: string; code: string; capacity: number } | null;
  starter?: { id: string; firstName: string; lastName: string; email: string };
  _count?: { attendanceRecords: number };
}

export interface PaginatedClassSessions {
  classSessions: ClassSession[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
