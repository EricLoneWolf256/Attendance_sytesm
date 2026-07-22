export interface CourseListItem {
  id: string;
  code: string;
  title: string;
  description: string | null;
  creditUnits: number;
  departmentId: string;
  level: number;
  prerequisites: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  department: { id: string; name: string; code: string };
  _count: { courseOfferings: number };
}

export type CourseDetail = CourseListItem;

export interface PaginatedCourses {
  courses: CourseListItem[];
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
