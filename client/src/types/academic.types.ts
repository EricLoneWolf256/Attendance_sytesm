export type ProgrammeLevel =
  | "UNDERGRADUATE"
  | "POSTGRADUATE"
  | "DIPLOMA"
  | "CERTIFICATE";

export type CourseOfferingStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ACTIVE"
  | "COMPLETED"
  | "ARCHIVED";

export interface Faculty {
  id: string;
  name: string;
  code: string;
  campusId: string;
  deanId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  campus?: { id: string; name: string; code: string };
  dean?:
    | { id: string; firstName: string; lastName: string; email: string }
    | null;
  _count?: { departments: number; users: number };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  hodId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  faculty?: { id: string; name: string; code: string };
  _count?: { programmes: number; courses: number };
}

export interface Programme {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  level: ProgrammeLevel;
  durationYears: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  department?: { id: string; name: string; code: string };
  _count?: { courseOfferings: number; users: number };
}

export interface Course {
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
  department?: { id: string; name: string; code: string };
  _count?: { courseOfferings: number };
}

export interface AcademicYear {
  id: string;
  code: string;
  label: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: { semesters: number };
}

export interface Semester {
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
  academicYear?: { id: string; label: string; code: string };
  _count?: { courseOfferings: number };
}

export interface CourseOffering {
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
  status: CourseOfferingStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  course?: { id: string; code: string; title: string; creditUnits: number };
  programme?: { id: string; name: string; code: string };
  semester?: { id: string; name: string; code: string };
  academicYear?: { id: string; label: string; code: string };
  lecturer?: { id: string; firstName: string; lastName: string; email: string };
  _count?: { enrollments: number; sessions: number };
}

export interface PaginatedResponse<T> {
  meta: { total: number; page: number; limit: number; totalPages: number };
  [key: string]:
    | T[]
    | { total: number; page: number; limit: number; totalPages: number };
}
