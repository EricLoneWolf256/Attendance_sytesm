import { z } from "zod";

export const createCourseSchema = z.object({
  code: z.string().min(2, "Course code must be at least 2 characters").max(20, "Course code must be at most 20 characters"),
  title: z.string().min(2, "Course title must be at least 2 characters"),
  description: z.string().optional().nullable(),
  creditUnits: z.number().int().min(0).max(20).default(3),
  departmentId: z.string().min(1, "Department is required"),
  level: z.number().int().min(1).max(10).default(1),
  prerequisites: z.string().optional().nullable(),
});

export const updateCourseSchema = z
  .object({
    code: z.string().min(2).max(20).optional(),
    title: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    creditUnits: z.number().int().min(0).max(20).optional(),
    departmentId: z.string().min(1).optional(),
    level: z.number().int().min(1).max(10).optional(),
    prerequisites: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listCoursesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["code", "title", "level", "creditUnits", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  departmentId: z.string().optional(),
  level: z.coerce.number().int().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;
