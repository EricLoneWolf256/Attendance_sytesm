import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  facultyId: z.string().min(1, "Faculty is required"),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2).optional(),
  facultyId: z.string().min(1).optional(),
});
