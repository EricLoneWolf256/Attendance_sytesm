export const queryKeys = {
  users: {
    all: ["users"] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  faculties: {
    all: ["faculties"] as const,
    detail: (id: string) => ["faculties", "detail", id] as const,
  },
  departments: {
    all: ["departments"] as const,
    byFaculty: (facultyId: string) => ["departments", "faculty", facultyId] as const,
  },
  programmes: {
    all: ["programmes"] as const,
    byDepartment: (deptId: string) => ["programmes", "department", deptId] as const,
  },
  courses: {
    all: ["courses"] as const,
    detail: (id: string) => ["courses", "detail", id] as const,
    byFaculty: (facultyId: string) => ["courses", "faculty", facultyId] as const,
    offerings: ["courses", "offerings"] as const,
    offeringsByLecturer: (lecturerId: string) => ["courses", "offerings", "lecturer", lecturerId] as const,
    offeringsCount: (courseId: string) => ["courses", "offerings", "count", courseId] as const,
  },
  sessions: {
    all: ["sessions"] as const,
    lecturer: (userId: string) => ["sessions", "lecturer", userId] as const,
    detail: (id: string) => ["sessions", "detail", id] as const,
  },
  attendance: {
    bySession: (sessionId: string) => ["attendance", "session", sessionId] as const,
    byStudent: (studentId: string) => ["attendance", "student", studentId] as const,
    activeSession: (sessionId: string) => ["attendance", "active", sessionId] as const,
  },
  stats: {
    system: ["stats", "system"] as const,
    faculty: (facultyId: string) => ["stats", "faculty", facultyId] as const,
  },
} as const;
