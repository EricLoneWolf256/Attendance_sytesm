import { z } from "zod";

export const createAcademicYearSchema = z.object({
  label: z.string().min(2, "Academic year label is required"),
  startDate: z.coerce.date({ required_error: "Start date is required" }),
  endDate: z.coerce.date({ required_error: "End date is required" }),
  isCurrent: z.boolean().optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const updateAcademicYearSchema = z
  .object({
    label: z.string().min(2).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    isCurrent: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listAcademicYearsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["label", "code", "startDate", "endDate", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  isCurrent: z.coerce.boolean().optional(),
});

export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;
export type UpdateAcademicYearInput = z.infer<typeof updateAcademicYearSchema>;
export type ListAcademicYearsQuery = z.infer<typeof listAcademicYearsQuerySchema>;
