import { z } from "zod";

export const createCampusSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const updateCampusSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});
