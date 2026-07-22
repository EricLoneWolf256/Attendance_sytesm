import { z } from "zod";

export const createProgrammeSchema = z.object({
  name: z.string().min(2, "Programme name must be at least 2 characters"),
  code: z.string().min(2, "Programme code must be at least 2 characters").max(10, "Programme code must be at most 10 characters"),
  departmentId: z.string().min(1, "Department is required"),
  level: z.enum(["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA", "CERTIFICATE"]).default("UNDERGRADUATE"),
  durationYears: z.number().int().min(1).max(10).default(4),
});

export const updateProgrammeSchema = z
  .object({
    name: z.string().min(2, "Programme name must be at least 2 characters").optional(),
    code: z.string().min(2, "Programme code must be at least 2 characters").max(10, "Programme code must be at most 10 characters").optional(),
    departmentId: z.string().min(1).optional(),
    level: z.enum(["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA", "CERTIFICATE"]).optional(),
    durationYears: z.number().int().min(1).max(10).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listProgrammesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["name", "code", "level", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  departmentId: z.string().optional(),
  level: z.enum(["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA", "CERTIFICATE"]).optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateProgrammeInput = z.infer<typeof createProgrammeSchema>;
export type UpdateProgrammeInput = z.infer<typeof updateProgrammeSchema>;
export type ListProgrammesQuery = z.infer<typeof listProgrammesQuerySchema>;
