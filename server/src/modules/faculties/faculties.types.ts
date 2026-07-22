export interface FacultyListItem {
  id: string;
  name: string;
  code: string;
  campusId: string;
  deanId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  campus: { id: string; name: string; code: string };
  dean: { id: string; firstName: string; lastName: string; email: string } | null;
  _count: { departments: number; users: number };
}

export interface FacultyDetail extends FacultyListItem {
  departments: { id: string; name: string; code: string; isActive: boolean }[];
}

export interface PaginatedFaculties {
  faculties: FacultyListItem[];
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
