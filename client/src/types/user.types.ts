export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "FACULTY_ADMIN"
  | "DEPARTMENT_ADMIN"
  | "LECTURER"
  | "STUDENT";

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "PENDING_VERIFICATION";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  studentNumber: string | null;
  staffNumber: string | null;
  role: UserRole;
  gender: "Male" | "Female" | "Other" | null;
  status: UserStatus;
  campusId: string;
  facultyId: string | null;
  programmeId: string | null;
  yearOfStudy: number | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  campus?: { id: string; name: string; code: string };
  faculty?: { id: string; name: string; code: string } | null;
  programme?: { id: string; name: string; code: string } | null;
}

export interface PaginatedUsers {
  users: User[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
