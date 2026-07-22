export interface CourseOfferingListItem {
  id: string;
  courseId: string;
  programmeId: string;
  yearOfStudy: number;
  semesterId: string;
  lecturerId: string;
  classRepId: string | null;
  academicYearId: string;
  maxEnrollment: number | null;
  currentEnrollment: number;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  course: { id: string; code: string; title: string; creditUnits: number };
  programme: { id: string; name: string; code: string };
  semester: { id: string; name: string; code: string };
  academicYear: { id: string; label: string; code: string };
  lecturer: { id: string; firstName: string; lastName: string; email: string };
  classRep: { id: string; firstName: string; lastName: string; email: string } | null;
  _count: { enrollments: number; sessions: number };
}

export interface CourseOfferingDetail extends CourseOfferingListItem {
  enrollments: { id: string; studentId: string; status: string; student: { id: string; firstName: string; lastName: string; email: string; studentNumber: string | null } }[];
}

export interface PaginatedCourseOfferings {
  courseOfferings: CourseOfferingListItem[];
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
