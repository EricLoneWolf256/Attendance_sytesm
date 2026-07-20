import { z } from "zod";

export const createCourseOfferingSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  programmeId: z.string().min(1, "Programme is required"),
  yearOfStudy: z.number().int().min(1).max(5),
  semesterId: z.string().min(1, "Semester is required"),
  lecturerId: z.string().min(1, "Lecturer is required"),
});

export const updateCourseOfferingSchema = z.object({
  courseId: z.string().min(1).optional(),
  programmeId: z.string().min(1).optional(),
  yearOfStudy: z.number().int().min(1).max(5).optional(),
  semesterId: z.string().min(1).optional(),
  lecturerId: z.string().min(1).optional(),
});
