import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { io } from "../index";

const router = Router();

const signInSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

const correctSchema = z.object({
  status: z.enum(["present", "absent", "late", "excused"]),
  reason: z.string().min(1, "Reason is required"),
});

router.post(
  "/sign-in",
  authenticate,
  authorize("STUDENT"),
  async (req: Request, res: Response) => {
    const { sessionId } = signInSchema.parse(req.body);

    const session = await prisma.classSession.findUnique({
      where: { id: sessionId as string },
      include: { courseOffering: true },
    });
    if (!session) throw new Error("NOT_FOUND");

    if (session.status !== "open") {
      return res.status(400).json({ error: "Session is not open" });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseOfferingId: {
          studentId: req.user!.userId,
          courseOfferingId: session.courseOfferingId,
        },
      },
    });
    if (!enrollment) {
      return res
        .status(403)
        .json({ error: "You are not enrolled in this course offering" });
    }

    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId: req.user!.userId,
        },
      },
    });
    if (existingRecord) {
      return res.status(409).json({ error: "Already signed in for this session" });
    }

    const now = new Date();
    const sessionStart = new Date(session.startTime);
    const diffMinutes = (now.getTime() - sessionStart.getTime()) / 60000;

    if (diffMinutes > 15) {
      return res
        .status(400)
        .json({ error: "Sign-in window has expired (15 minutes from session start)" });
    }

    const student = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { name: true },
    });

    const record = await prisma.attendanceRecord.create({
      data: {
        sessionId,
        studentId: req.user!.userId,
        status: diffMinutes > 10 ? "late" : "present",
        signedInAt: now,
        signInMethod: "self",
      },
      include: {
        student: { select: { id: true, name: true, email: true, regNumber: true } },
      },
    });

    io.to(`session:${sessionId}`).emit("student-signed-in", {
      studentId: req.user!.userId,
      studentName: student?.name,
      signedInAt: now,
    });

    res.status(201).json({ record });
  }
);

router.get(
  "/session/:sessionId",
  authenticate,
  authorize("STUDENT", "LECTURER", "ADMIN", "SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    const session = await prisma.classSession.findUnique({
      where: { id: req.params.sessionId as string },
    });
    if (!session) throw new Error("NOT_FOUND");

    const records = await prisma.attendanceRecord.findMany({
      where: { sessionId: req.params.sessionId as string },
      include: {
        student: { select: { id: true, name: true, email: true, regNumber: true } },
      },
      orderBy: { signedInAt: "asc" },
    });

    res.json({ records });
  }
);

router.put(
  "/:id/correct",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    const { status, reason } = correctSchema.parse(req.body);

    const record = await prisma.attendanceRecord.findUnique({
      where: { id: req.params.id as string },
    });
    if (!record) throw new Error("NOT_FOUND");

    const updated = await prisma.attendanceRecord.update({
      where: { id: req.params.id as string },
      data: {
        status,
        markedBy: req.user!.userId,
      },
      include: {
        student: { select: { id: true, name: true, email: true, regNumber: true } },
        session: { select: { id: true, date: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user!.userId,
        action: `attendance_correction: ${reason}`,
        targetTable: "attendance_records",
        targetId: req.params.id as string,
        beforeJson: { status: record.status },
        afterJson: { status, reason },
      },
    });

    res.json({ record: updated });
  }
);

export default router;
