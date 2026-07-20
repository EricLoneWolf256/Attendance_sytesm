import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

const updateProfileSchema = z.object({
  regNumber: z.string().optional(),
  campusId: z.string().min(1).optional(),
  facultyId: z.string().optional().nullable(),
  programmeId: z.string().optional().nullable(),
  yearOfStudy: z.number().int().min(1).max(5).optional().nullable(),
});

const enrollSchema = z.object({
  courseOfferingId: z.string().min(1, "Course offering ID is required"),
});

router.get(
  "/profile",
  authenticate,
  authorize("STUDENT"),
  async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        regNumber: true,
        gender: true,
        role: true,
        yearOfStudy: true,
        campus: { select: { id: true, name: true } },
        faculty: { select: { id: true, name: true } },
        programme: { select: { id: true, name: true, level: true } },
      },
    });

    if (!user) throw new Error("NOT_FOUND");

    res.json({ profile: user });
  }
);

router.put(
  "/profile",
  authenticate,
  authorize("STUDENT"),
  async (req: Request, res: Response) => {
    const data = updateProfileSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });
    if (!existing) throw new Error("NOT_FOUND");

    if (data.campusId) {
      const campus = await prisma.campus.findUnique({
        where: { id: data.campusId },
      });
      if (!campus) throw new Error("NOT_FOUND");
    }

    if (data.facultyId) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: data.facultyId },
      });
      if (!faculty) throw new Error("NOT_FOUND");
    }

    if (data.programmeId) {
      const programme = await prisma.programme.findUnique({
        where: { id: data.programmeId },
      });
      if (!programme) throw new Error("NOT_FOUND");
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        regNumber: true,
        gender: true,
        role: true,
        yearOfStudy: true,
        campus: { select: { id: true, name: true } },
        faculty: { select: { id: true, name: true } },
        programme: { select: { id: true, name: true, level: true } },
      },
    });

    res.json({ profile: user });
  }
);

router.get(
  "/enrollments",
  authenticate,
  authorize("STUDENT"),
  async (req: Request, res: Response) => {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.user!.userId },
      include: {
        courseOffering: {
          include: {
            course: { select: { id: true, code: true, title: true, creditUnits: true } },
            programme: { select: { id: true, name: true } },
            semester: { select: { id: true, name: true } },
            lecturer: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    res.json({ enrollments });
  }
);

router.post(
  "/enrollments",
  authenticate,
  authorize("STUDENT"),
  async (req: Request, res: Response) => {
    const { courseOfferingId } = enrollSchema.parse(req.body);

    const courseOffering = await prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: { semester: true },
    });
    if (!courseOffering) throw new Error("NOT_FOUND");

    const student = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });
    if (!student) throw new Error("NOT_FOUND");

    if (!student.programmeId || !student.yearOfStudy) {
      return res
        .status(400)
        .json({ error: "Student must have a programme and year of study to enroll" });
    }

    if (student.programmeId !== courseOffering.programmeId) {
      return res
        .status(400)
        .json({ error: "Course offering does not match your programme" });
    }

    if (student.yearOfStudy !== courseOffering.yearOfStudy) {
      return res
        .status(400)
        .json({ error: "Course offering does not match your year of study" });
    }

    if (!courseOffering.semester.isActive) {
      return res.status(400).json({ error: "Semester is not active" });
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_courseOfferingId: {
          studentId: req.user!.userId,
          courseOfferingId,
        },
      },
    });
    if (existing) {
      return res.status(409).json({ error: "Already enrolled in this course offering" });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: req.user!.userId,
        courseOfferingId,
      },
      include: {
        courseOffering: {
          include: {
            course: { select: { id: true, code: true, title: true } },
            programme: { select: { id: true, name: true } },
            semester: { select: { id: true, name: true } },
            lecturer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    res.status(201).json({ enrollment });
  }
);

router.delete(
  "/enrollments/:id",
  authenticate,
  authorize("STUDENT"),
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const enrollment = await prisma.enrollment.findUnique({ where: { id } });
    if (!enrollment) throw new Error("NOT_FOUND");

    if (enrollment.studentId !== req.user!.userId) {
      throw new Error("FORBIDDEN");
    }

    await prisma.enrollment.delete({ where: { id } });
    res.json({ message: "Enrollment removed" });
  }
);

export default router;
