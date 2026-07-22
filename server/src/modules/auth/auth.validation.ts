import { z } from "zod";

const umuEmailRegex = /^[\w.-]+@(stud\.umu\.ac\.ug|umu\.ac\.ug)$/;

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().regex(umuEmailRegex, "Use a valid UMU email (@umu.ac.ug or @stud.umu.ac.ug)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  campusId: z.string().min(1, "Campus is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
