import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "LECTURER", "STUDENT"]),
  regNumber: z.string().optional(),
  staffNumber: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  campusId: z.string().min(1, "Campus is required"),
  facultyId: z.string().optional(),
  programmeId: z.string().optional(),
  yearOfStudy: z.number().int().min(1).max(5).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "LECTURER", "STUDENT"]).optional(),
  regNumber: z.string().optional().nullable(),
  staffNumber: z.string().optional().nullable(),
  gender: z.enum(["Male", "Female", "Other"]).optional().nullable(),
  campusId: z.string().min(1).optional(),
  facultyId: z.string().optional().nullable(),
  programmeId: z.string().optional().nullable(),
  yearOfStudy: z.number().int().min(1).max(5).optional().nullable(),
  status: z.enum(["active", "suspended"]).optional(),
});

export const assignClassRepSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  programmeId: z.string().min(1, "Programme is required"),
  yearOfStudy: z.number().int().min(1).max(5),
  semesterId: z.string().min(1, "Semester is required"),
});

export const createEnrollmentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  courseOfferingId: z.string().min(1, "Course offering is required"),
});

export const bulkEnrollmentSchema = z.object({
  courseOfferingId: z.string().min(1, "Course offering is required"),
  studentIds: z.array(z.string()).min(1, "At least one student is required"),
});
