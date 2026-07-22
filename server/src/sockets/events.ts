export const SOCKET_EVENTS = {
  // Client → Server
  JOIN_SESSION: "join-session",
  LEAVE_SESSION: "leave-session",
  JOIN_COURSE_OFFERING: "join-course-offering",
  LEAVE_COURSE_OFFERING: "leave-course-offering",
  JOIN_LECTURER: "join-lecturer",
  LEAVE_LECTURER: "leave-lecturer",
  JOIN_FACULTY: "join-faculty",
  LEAVE_FACULTY: "leave-faculty",
  JOIN_ADMIN: "join-admin",
  LEAVE_ADMIN: "leave-admin",

  // Server → Client: Session lifecycle
  SESSION_CREATED: "session.created",
  SESSION_STARTED: "session.started",
  SESSION_UPDATED: "session.updated",
  SESSION_CLOSED: "session.closed",

  // Server → Client: Attendance
  ATTENDANCE_CHECKED_IN: "attendance.checked_in",
  ATTENDANCE_UPDATED: "attendance.updated",
  ATTENDANCE_SUMMARY_UPDATED: "attendance.summary_updated",

  // Server → Client: System
  CONNECTED: "connected",
  ERROR: "error",
} as const;
