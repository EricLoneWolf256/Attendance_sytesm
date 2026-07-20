import { z } from "zod";

export const createFacultySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  campusId: z.string().min(1, "Campus is required"),
});

export const updateFacultySchema = z.object({
  name: z.string().min(2).optional(),
  campusId: z.string().min(1).optional(),
});
