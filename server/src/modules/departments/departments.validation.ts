import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  code: z.string().min(2, "Department code must be at least 2 characters").max(10, "Department code must be at most 10 characters"),
  facultyId: z.string().min(1, "Faculty is required"),
  hodId: z.string().optional().nullable(),
});

export const updateDepartmentSchema = z
  .object({
    name: z.string().min(2, "Department name must be at least 2 characters").optional(),
    code: z.string().min(2, "Department code must be at least 2 characters").max(10, "Department code must be at most 10 characters").optional(),
    facultyId: z.string().min(1).optional(),
    hodId: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listDepartmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["name", "code", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  facultyId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type ListDepartmentsQuery = z.infer<typeof listDepartmentsQuerySchema>;
