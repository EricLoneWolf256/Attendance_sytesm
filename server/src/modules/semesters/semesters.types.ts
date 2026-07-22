export interface SemesterListItem {
  id: string;
  code: string;
  academicYearId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  intakeMonth: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  academicYear: { id: string; label: string; code: string };
  _count: { courseOfferings: number; classReps: number; classSessions: number };
}

export type SemesterDetail = SemesterListItem;

export interface PaginatedSemesters {
  semesters: SemesterListItem[];
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
