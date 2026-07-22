export interface AcademicYearListItem {
  id: string;
  code: string;
  label: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: { semesters: number; courseOfferings: number };
}

export interface AcademicYearDetail extends AcademicYearListItem {
  semesters: {
    id: string;
    code: string;
    name: string;
    startDate: Date;
    endDate: Date;
    intakeMonth: string | null;
    isActive: boolean;
  }[];
}

export interface PaginatedAcademicYears {
  academicYears: AcademicYearListItem[];
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
