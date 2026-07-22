export interface DepartmentListItem {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  hodId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  faculty: { id: string; name: string; code: string };
  hod: { id: string; firstName: string; lastName: string; email: string } | null;
  _count: { programmes: number; courses: number };
}

export interface DepartmentDetail extends DepartmentListItem {
  programmes: { id: string; name: string; code: string; level: string; isActive: boolean }[];
  courses: { id: string; code: string; title: string; creditUnits: number; isActive: boolean }[];
}

export interface PaginatedDepartments {
  departments: DepartmentListItem[];
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
