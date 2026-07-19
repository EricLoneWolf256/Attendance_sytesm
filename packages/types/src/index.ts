export enum Role {
  STUDENT = "STUDENT",
  LECTURER = "LECTURER",
  ADMIN = "ADMIN",
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
}

export interface UserPayload {
  id: string;
  email: string;
  role: Role;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  studentNumber?: string;
  phoneNumber?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface QRSessionData {
  sessionId: string;
  qrCode: string;
  expiresAt: string;
  courseId: string;
  courseName: string;
}

export interface CheckInRequest {
  qrCode: string;
  studentId: string;
  deviceId?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  qrSessionId: string;
  status: AttendanceStatus;
  checkedInAt: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  semesterId: string;
  programId: string;
  lecturerId: string;
}

export interface Faculty {
  id: string;
  name: string;
  code: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  facultyId: string;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  level: string;
}

export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
