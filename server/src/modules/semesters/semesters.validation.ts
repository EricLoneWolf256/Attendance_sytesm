import { z } from "zod";

export const createSemesterSchema = z.object({
  academicYearId: z.string().min(1, "Academic year is required"),
  name: z.string().min(1, "Semester name is required"),
  startDate: z.coerce.date({ required_error: "Start date is required" }),
  endDate: z.coerce.date({ required_error: "End date is required" }),
  intakeMonth: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const updateSemesterSchema = z
  .object({
    name: z.string().min(1).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    intakeMonth: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listSemestersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["name", "code", "startDate", "endDate", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  academicYearId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateSemesterInput = z.infer<typeof createSemesterSchema>;
export type UpdateSemesterInput = z.infer<typeof updateSemesterSchema>;
export type ListSemestersQuery = z.infer<typeof listSemestersQuerySchema>;
