export const rooms = {
  session(sessionId: string): string {
    return `session:${sessionId}`;
  },

  courseOffering(offeringId: string): string {
    return `course-offering:${offeringId}`;
  },

  lecturer(lecturerId: string): string {
    return `lecturer:${lecturerId}`;
  },

  faculty(facultyId: string): string {
    return `faculty:${facultyId}`;
  },

  admin(): string {
    return "admins";
  },

  user(userId: string): string {
    return `user:${userId}`;
  },
} as const;

export const ADMIN_ROLES = new Set([
  "SUPER_ADMIN",
  "ADMIN",
  "FACULTY_ADMIN",
  "DEPARTMENT_ADMIN",
]);
