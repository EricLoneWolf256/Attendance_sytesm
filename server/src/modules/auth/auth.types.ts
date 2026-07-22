import { UserRole, UserStatus } from "@prisma/client";

export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  studentNumber: string | null;
  staffNumber: string | null;
  gender: string | null;
  campusId: string;
  facultyId: string | null;
  programmeId: string | null;
  yearOfStudy: number | null;
}

export interface UserProfile extends SafeUser {
  campus: { id: string; name: string; code: string };
  faculty: { id: string; name: string; code: string } | null;
  programme: { id: string; name: string; code: string } | null;
  createdAt: Date;
}
