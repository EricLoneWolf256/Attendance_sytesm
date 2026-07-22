import { z } from "zod";

export const markAttendanceSchema = z.object({
  sessionId: z.string().min(1, "Session is required"),
  studentId: z.string().min(1, "Student is required"),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]).default("PRESENT"),
  signInMethod: z.enum(["QR", "PIN", "SELF", "ADMIN_OVERRIDE"]).default("SELF"),
  deviceFingerprint: z.string().optional().nullable(),
});

export const bulkMarkAttendanceSchema = z.object({
  sessionId: z.string().min(1, "Session is required"),
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]).default("PRESENT"),
    })
  ).min(1, "At least one record is required"),
  signInMethod: z.enum(["QR", "PIN", "SELF", "ADMIN_OVERRIDE"]).default("ADMIN_OVERRIDE"),
});

export const updateAttendanceSchema = z
  .object({
    status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]).optional(),
    signInMethod: z.enum(["QR", "PIN", "SELF", "ADMIN_OVERRIDE"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listAttendanceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["signedInAt", "status", "createdAt"]).default("signedInAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  sessionId: z.string().optional(),
  studentId: z.string().optional(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]).optional(),
  signInMethod: z.enum(["QR", "PIN", "SELF", "ADMIN_OVERRIDE"]).optional(),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type BulkMarkAttendanceInput = z.infer<typeof bulkMarkAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
export type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>;
