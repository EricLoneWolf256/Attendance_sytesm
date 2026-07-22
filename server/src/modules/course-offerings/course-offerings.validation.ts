import { z } from "zod";

export const createCourseOfferingSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  programmeId: z.string().min(1, "Programme is required"),
  yearOfStudy: z.number().int().min(1).max(10, "Year of study must be between 1 and 10"),
  semesterId: z.string().min(1, "Semester is required"),
  lecturerId: z.string().min(1, "Lecturer is required"),
  classRepId: z.string().optional().nullable(),
  academicYearId: z.string().min(1, "Academic year is required"),
  maxEnrollment: z.number().int().min(1).optional().nullable(),
});

export const updateCourseOfferingSchema = z
  .object({
    lecturerId: z.string().min(1).optional(),
    classRepId: z.string().optional().nullable(),
    maxEnrollment: z.number().int().min(1).optional().nullable(),
    status: z.enum(["DRAFT", "PUBLISHED", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const listCourseOfferingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "yearOfStudy", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  courseId: z.string().optional(),
  programmeId: z.string().optional(),
  semesterId: z.string().optional(),
  academicYearId: z.string().optional(),
  lecturerId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateCourseOfferingInput = z.infer<typeof createCourseOfferingSchema>;
export type UpdateCourseOfferingInput = z.infer<typeof updateCourseOfferingSchema>;
export type ListCourseOfferingsQuery = z.infer<typeof listCourseOfferingsQuerySchema>;
