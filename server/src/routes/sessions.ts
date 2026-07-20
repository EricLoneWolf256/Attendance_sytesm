import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

const createSessionSchema = z.object({
  courseOfferingId: z.string().min(1, "Course offering ID is required"),
  date: z.string().min(1, "Date is required"),
  modeOfTeaching: z.enum(["online", "physical"]),
  startTime: z.string().min(1, "Start time is required"),
  venue: z.string().optional(),
  topic: z.string().optional(),
});

router.get(
  "/",
  authenticate,
  authorize("STUDENT", "LECTURER", "ADMIN", "SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    const role = req.user!.role;

    const where: Record<string, unknown> = {};

    if (role === "STUDENT") {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: req.user!.userId },
        select: { courseOfferingId: true },
      });
      const offeringIds = enrollments.map((e) => e.courseOfferingId);
      where.courseOfferingId = { in: offeringIds };
    } else if (role === "LECTURER") {
      where.courseOffering = { lecturerId: req.user!.userId };
    } else if (role === "ADMIN") {
      const admin = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { facultyId: true },
      });
      if (!admin?.facultyId) throw new Error("FORBIDDEN");
      where.courseOffering = {
        course: { department: { facultyId: admin.facultyId } },
      };
    }

    const sessions = await prisma.classSession.findMany({
      where,
      include: {
        courseOffering: {
          include: {
            course: { select: { id: true, code: true, title: true } },
            programme: { select: { id: true, name: true } },
            lecturer: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { attendanceRecords: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ sessions });
  }
);

router.get(
  "/:id",
  authenticate,
  authorize("STUDENT", "LECTURER", "ADMIN", "SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    const session = await prisma.classSession.findUnique({
      where: { id: req.params.id as string },
      include: {
        courseOffering: {
          include: {
            course: { select: { id: true, code: true, title: true } },
            programme: { select: { id: true, name: true } },
            semester: { select: { id: true, name: true } },
            lecturer: { select: { id: true, name: true, email: true } },
          },
        },
        starter: { select: { id: true, name: true, email: true } },
        attendanceRecords: {
          include: {
            student: { select: { id: true, name: true, email: true, regNumber: true } },
          },
          orderBy: { signedInAt: "asc" },
        },
      },
    });

    if (!session) throw new Error("NOT_FOUND");

    res.json({ session });
  }
);

router.post(
  "/",
  authenticate,
  authorize("STUDENT"),
  async (req: Request, res: Response) => {
    const data = createSessionSchema.parse(req.body);

    const courseOffering = await prisma.courseOffering.findUnique({
      where: { id: data.courseOfferingId },
      include: { semester: true },
    });
    if (!courseOffering) throw new Error("NOT_FOUND");

    const classRep = await prisma.classRep.findUnique({
      where: {
        programmeId_yearOfStudy_semesterId: {
          programmeId: courseOffering.programmeId,
          yearOfStudy: courseOffering.yearOfStudy,
          semesterId: courseOffering.semesterId,
        },
      },
    });

    if (!classRep || classRep.studentId !== req.user!.userId) {
      throw new Error("FORBIDDEN");
    }

    const session = await prisma.classSession.create({
      data: {
        courseOfferingId: data.courseOfferingId,
        startedBy: req.user!.userId,
        date: new Date(data.date),
        modeOfTeaching: data.modeOfTeaching,
        startTime: new Date(data.startTime),
        venue: data.venue,
        topic: data.topic,
      },
      include: {
        courseOffering: {
          include: {
            course: { select: { id: true, code: true, title: true } },
            programme: { select: { id: true, name: true } },
          },
        },
      },
    });

    res.status(201).json({ session });
  }
);

router.put(
  "/:id/close",
  authenticate,
  authorize("STUDENT", "ADMIN", "SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    const session = await prisma.classSession.findUnique({
      where: { id: req.params.id as string },
    });
    if (!session) throw new Error("NOT_FOUND");

    if (session.status === "closed") {
      return res.status(400).json({ error: "Session is already closed" });
    }

    if (req.user!.role === "STUDENT" && session.startedBy !== req.user!.userId) {
      throw new Error("FORBIDDEN");
    }

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - session.startTime.getTime()) / 60000);

    const updated = await prisma.classSession.update({
      where: { id: req.params.id as string },
      data: {
        endTime,
        duration,
        status: "closed",
        closedAt: endTime,
      },
      include: {
        courseOffering: {
          include: {
            course: { select: { id: true, code: true, title: true } },
            programme: { select: { id: true, name: true } },
          },
        },
      },
    });

    res.json({ session: updated });
  }
);

router.put(
  "/:id/confirm",
  authenticate,
  authorize("LECTURER"),
  async (req: Request, res: Response) => {
    const session = await prisma.classSession.findUnique({
      where: { id: req.params.id as string },
      include: { courseOffering: true },
    });
    if (!session) throw new Error("NOT_FOUND");

    if (session.courseOffering.lecturerId !== req.user!.userId) {
      throw new Error("FORBIDDEN");
    }

    const updated = await prisma.classSession.update({
      where: { id: req.params.id as string },
      data: { lecturerConfirmedAt: new Date() },
      include: {
        courseOffering: {
          include: {
            course: { select: { id: true, code: true, title: true } },
            programme: { select: { id: true, name: true } },
          },
        },
      },
    });

    res.json({ session: updated });
  }
);

export default router;
