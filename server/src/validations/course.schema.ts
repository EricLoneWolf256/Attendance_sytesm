import { z } from "zod";

export const createCourseSchema = z.object({
  code: z.string().min(2, "Code is required"),
  title: z.string().min(2, "Title is required"),
  creditUnits: z.number().int().min(1).max(6).default(3),
  departmentId: z.string().min(1, "Department is required"),
});

export const updateCourseSchema = z.object({
  code: z.string().min(2).optional(),
  title: z.string().min(2).optional(),
  creditUnits: z.number().int().min(1).max(6).optional(),
  departmentId: z.string().min(1).optional(),
});
