export interface ProgrammeListItem {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  level: string;
  durationYears: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  department: { id: string; name: string; code: string; facultyId: string };
  _count: { courseOfferings: number; users: number; classReps: number };
}

export interface ProgrammeDetail extends ProgrammeListItem {
  attendancePolicies: { id: string; minPercentage: number; lateThreshold: number }[];
}

export interface PaginatedProgrammes {
  programmes: ProgrammeListItem[];
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
