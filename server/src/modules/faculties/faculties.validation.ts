import { z } from "zod";

export const createFacultySchema = z.object({
  name: z.string().min(2, "Faculty name must be at least 2 characters"),
  code: z.string().min(2, "Faculty code must be at least 2 characters").max(10, "Faculty code must be at most 10 characters"),
  campusId: z.string().min(1, "Campus is required"),
  deanId: z.string().optional().nullable(),
});

export const updateFacultySchema = z
  .object({
    name: z.string().min(2, "Faculty name must be at least 2 characters").optional(),
    code: z.string().min(2, "Faculty code must be at least 2 characters").max(10, "Faculty code must be at most 10 characters").optional(),
    campusId: z.string().min(1).optional(),
    deanId: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listFacultiesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["name", "code", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  campusId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateFacultyInput = z.infer<typeof createFacultySchema>;
export type UpdateFacultyInput = z.infer<typeof updateFacultySchema>;
export type ListFacultiesQuery = z.infer<typeof listFacultiesQuerySchema>;
