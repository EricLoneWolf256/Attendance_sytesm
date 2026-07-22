export interface EnrollmentListItem {
  id: string;
  studentId: string;
  courseOfferingId: string;
  classGroupId: string | null;
  status: string;
  enrolledAt: Date;
  droppedAt: Date | null;
  student: { id: string; firstName: string; lastName: string; email: string; studentNumber: string | null };
  courseOffering: { id: string; course: { code: string; title: string }; programme: { name: string; code: string }; yearOfStudy: number };
  classGroup: { id: string; name: string } | null;
}

export type EnrollmentDetail = EnrollmentListItem;

export interface PaginatedEnrollments {
  enrollments: EnrollmentListItem[];
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
