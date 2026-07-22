import { UserRole, UserStatus } from "@prisma/client";

export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  studentNumber: string | null;
  staffNumber: string | null;
  role: UserRole;
  status: UserStatus;
  gender: string | null;
  profilePicture: string | null;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  campusId: string;
  facultyId: string | null;
  programmeId: string | null;
  yearOfStudy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithRelations extends SafeUser {
  campus: { id: string; name: string; code: string };
  faculty: { id: string; name: string; code: string } | null;
  programme: { id: string; name: string; code: string } | null;
}

export interface PaginatedUsers {
  users: UserWithRelations[];
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
