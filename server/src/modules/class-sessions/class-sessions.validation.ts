import { z } from "zod";

export const createClassSessionSchema = z.object({
  courseOfferingId: z.string().min(1, "Course offering is required"),
  semesterId: z.string().optional().nullable(),
  venueId: z.string().optional().nullable(),
  date: z.coerce.date({ required_error: "Date is required" }),
  modeOfTeaching: z.enum(["ONLINE", "PHYSICAL", "HYBRID"]).default("PHYSICAL"),
  startTime: z.coerce.date({ required_error: "Start time is required" }),
  endTime: z.coerce.date().optional().nullable(),
  topic: z.string().optional().nullable(),
  materials: z.string().optional().nullable(),
  maxCheckInTime: z.coerce.date().optional().nullable(),
});

export const updateClassSessionSchema = z
  .object({
    venueId: z.string().optional().nullable(),
    date: z.coerce.date().optional(),
    modeOfTeaching: z.enum(["ONLINE", "PHYSICAL", "HYBRID"]).optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional().nullable(),
    topic: z.string().optional().nullable(),
    materials: z.string().optional().nullable(),
    maxCheckInTime: z.coerce.date().optional().nullable(),
    status: z.enum(["SCHEDULED", "OPEN", "CLOSED", "CANCELLED"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listClassSessionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["date", "startTime", "status", "createdAt"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  courseOfferingId: z.string().optional(),
  semesterId: z.string().optional(),
  venueId: z.string().optional(),
  startedBy: z.string().optional(),
  status: z.enum(["SCHEDULED", "OPEN", "CLOSED", "CANCELLED"]).optional(),
  modeOfTeaching: z.enum(["ONLINE", "PHYSICAL", "HYBRID"]).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type CreateClassSessionInput = z.infer<typeof createClassSessionSchema>;
export type UpdateClassSessionInput = z.infer<typeof updateClassSessionSchema>;
export type ListClassSessionsQuery = z.infer<typeof listClassSessionsQuerySchema>;
