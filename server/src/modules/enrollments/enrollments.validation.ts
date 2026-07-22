import { z } from "zod";

export const createEnrollmentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  courseOfferingId: z.string().min(1, "Course offering is required"),
  classGroupId: z.string().optional().nullable(),
});

export const bulkCreateEnrollmentSchema = z.object({
  studentIds: z.array(z.string().min(1)).min(1, "At least one student is required"),
  courseOfferingId: z.string().min(1, "Course offering is required"),
});

export const updateEnrollmentSchema = z
  .object({
    classGroupId: z.string().optional().nullable(),
    status: z.enum(["ENROLLED", "DROPPED", "COMPLETED", "WITHDRAWN"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listEnrollmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["enrolledAt", "status", "createdAt"]).default("enrolledAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  courseOfferingId: z.string().optional(),
  studentId: z.string().optional(),
  classGroupId: z.string().optional(),
  status: z.enum(["ENROLLED", "DROPPED", "COMPLETED", "WITHDRAWN"]).optional(),
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type BulkCreateEnrollmentInput = z.infer<typeof bulkCreateEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
export type ListEnrollmentsQuery = z.infer<typeof listEnrollmentsQuerySchema>;
