import type { UserRole } from "@/types";

export const ROUTES = {
  login: "/login",
  home: "/",
  student: {
    root: "/student",
    dashboard: "/student/dashboard",
    checkin: "/student/checkin",
    history: "/student/history",
  },
  classrep: {
    root: "/classrep",
    dashboard: "/classrep/dashboard",
    sessions: "/classrep/sessions",
    sessionDetail: (id: string) => `/classrep/sessions/${id}`,
  },
  lecturer: {
    root: "/lecturer",
    dashboard: "/lecturer/dashboard",
    sessions: "/lecturer/sessions",
    sessionDetail: (id: string) => `/lecturer/sessions/${id}`,
  },
  facultyAdmin: {
    root: "/faculty-admin",
    dashboard: "/faculty-admin/dashboard",
    reports: "/faculty-admin/reports",
  },
  superAdmin: {
    root: "/admin",
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    faculties: "/admin/faculties",
    courses: "/admin/courses",
    settings: "/admin/settings",
  },
} as const;

export const ROLE_HOME: Record<UserRole, string> = {
  SUPER_ADMIN: ROUTES.superAdmin.root,
  ADMIN: ROUTES.facultyAdmin.root,
  FACULTY_ADMIN: ROUTES.facultyAdmin.root,
  DEPARTMENT_ADMIN: ROUTES.facultyAdmin.root,
  LECTURER: ROUTES.lecturer.root,
  STUDENT: ROUTES.student.dashboard,
};
