import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { getParam } from "../utils/params";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { semesterId, programId } = req.query;
    const where: any = {};
    if (semesterId) where.semesterId = semesterId as string;
    if (programId) where.programId = programId as string;

    const courses = await prisma.course.findMany({
      where,
      include: { semester: true, program: true, enrollments: true, lecturer: { include: { user: true } } },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: courses });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/my", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { studentProfile: true, lecturerProfile: true },
    });

    let courses;
    if (req.user.role === Role.LECTURER) {
      const lecturerProfile = await prisma.lecturerProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (lecturerProfile) {
        courses = await prisma.course.findMany({
          where: { lecturerId: lecturerProfile.id },
          include: { semester: true, program: true, enrollments: true, lecturer: { include: { user: true } } },
        });
      }
    } else if (user?.studentProfile) {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: user.studentProfile.id },
        include: { course: { include: { semester: true, program: true, enrollments: true, lecturer: { include: { user: true } } } } },
      });
      courses = enrollments.map((e) => e.course);
    }

    res.json({ success: true, data: courses || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, semesterId, programId, lecturerId } = req.body;
    const course = await prisma.course.create({
      data: { name, code, semesterId, programId, lecturerId: lecturerId || null },
    });
    res.status(201).json({ success: true, data: course });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put("/:id", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, semesterId, programId, lecturerId } = req.body;
    const course = await prisma.course.update({
      where: { id: getParam(req.params.id) },
      data: { name, code, semesterId, programId, lecturerId: lecturerId || null },
    });
    res.json({ success: true, data: course });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete("/:id", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.course.delete({ where: { id: getParam(req.params.id) } });
    res.json({ success: true, message: "Course deleted" });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
