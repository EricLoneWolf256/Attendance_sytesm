import type { UserRole } from "@/types";

export const ALL_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN", "DEPARTMENT_ADMIN", "LECTURER", "STUDENT"];

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  FACULTY_ADMIN: "Faculty Admin",
  DEPARTMENT_ADMIN: "Department Admin",
  LECTURER: "Lecturer",
  STUDENT: "Student",
};

export const ROLE_DOT_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-purple-500",
  ADMIN: "bg-blue-500",
  FACULTY_ADMIN: "bg-indigo-500",
  DEPARTMENT_ADMIN: "bg-teal-500",
  LECTURER: "bg-green-500",
  STUDENT: "bg-gray-500",
};

export const ROLE_BADGE_COLORS_DARK: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-purple-500",
  ADMIN: "bg-blue-500",
  FACULTY_ADMIN: "bg-indigo-500",
  DEPARTMENT_ADMIN: "bg-teal-500",
  LECTURER: "bg-green-500",
  STUDENT: "bg-gray-500",
};

export const ROLE_BADGE_COLORS_LIGHT: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800",
  ADMIN: "bg-blue-100 text-blue-800",
  FACULTY_ADMIN: "bg-indigo-100 text-indigo-800",
  DEPARTMENT_ADMIN: "bg-teal-100 text-teal-800",
  LECTURER: "bg-green-100 text-green-800",
  STUDENT: "bg-gray-100 text-gray-800",
};
