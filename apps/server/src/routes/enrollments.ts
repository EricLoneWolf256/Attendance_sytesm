import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { getParam } from "../utils/params";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", authenticate, authorize(Role.ADMIN, Role.LECTURER), async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.query;
    const where: any = {};
    if (courseId) where.courseId = courseId as string;

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        student: { include: { user: true, program: true } },
        course: true,
      },
      orderBy: { enrolledAt: "desc" },
    });
    res.json({ success: true, data: enrollments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, courseId } = req.body;
    const enrollment = await prisma.enrollment.create({
      data: { studentId, courseId },
      include: { student: { include: { user: true } }, course: true },
    });
    res.status(201).json({ success: true, data: enrollment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete("/:id", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.enrollment.delete({ where: { id: getParam(req.params.id) } });
    res.json({ success: true, message: "Enrollment removed" });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
