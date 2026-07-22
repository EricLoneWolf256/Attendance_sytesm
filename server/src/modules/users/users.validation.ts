import { z } from "zod";

const umuEmailRegex = /^[\w.-]+@(stud\.umu\.ac\.ug|umu\.ac\.ug)$/;

export const createUserSchema = z.object({
  email: z.string().regex(umuEmailRegex, "Use a valid UMU email (@umu.ac.ug or @stud.umu.ac.ug)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().optional(),
  studentNumber: z.string().optional(),
  staffNumber: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN", "DEPARTMENT_ADMIN", "LECTURER", "STUDENT"]),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  campusId: z.string().min(1, "Campus is required"),
  facultyId: z.string().optional().nullable(),
  programmeId: z.string().optional().nullable(),
  yearOfStudy: z.number().int().min(1).max(10).optional().nullable(),
});

export const updateUserSchema = z
  .object({
    email: z.string().regex(umuEmailRegex, "Use a valid UMU email").optional(),
    firstName: z.string().min(2, "First name must be at least 2 characters").optional(),
    lastName: z.string().min(2, "Last name must be at least 2 characters").optional(),
    phoneNumber: z.string().optional().nullable(),
    studentNumber: z.string().optional().nullable(),
    staffNumber: z.string().optional().nullable(),
    gender: z.enum(["Male", "Female", "Other"]).optional().nullable(),
    campusId: z.string().min(1).optional(),
    facultyId: z.string().optional().nullable(),
    programmeId: z.string().optional().nullable(),
    yearOfStudy: z.number().int().min(1).max(10).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]),
});

export const updateRoleSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN", "DEPARTMENT_ADMIN", "LECTURER", "STUDENT"]),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "firstName", "lastName", "email", "role", "status", "lastLoginAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  role: z
    .enum(["SUPER_ADMIN", "ADMIN", "FACULTY_ADMIN", "DEPARTMENT_ADMIN", "LECTURER", "STUDENT"])
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]).optional(),
  campusId: z.string().optional(),
  facultyId: z.string().optional(),
  programmeId: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
