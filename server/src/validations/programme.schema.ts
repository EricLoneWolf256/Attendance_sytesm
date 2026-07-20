import { z } from "zod";

export const createProgrammeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  departmentId: z.string().min(1, "Department is required"),
  level: z.enum(["undergraduate", "postgraduate", "diploma"]).default("undergraduate"),
});

export const updateProgrammeSchema = z.object({
  name: z.string().min(2).optional(),
  departmentId: z.string().min(1).optional(),
  level: z.enum(["undergraduate", "postgraduate", "diploma"]).optional(),
});
