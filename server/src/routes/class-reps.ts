import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { assignClassRepSchema } from "../validations/user.schema";

const router = Router();

router.get("/", authenticate, authorize("SUPER_ADMIN", "ADMIN", "LECTURER"), async (req: Request, res: Response) => {
  const where: Record<string, unknown> = {};

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    if (!admin?.facultyId) {
      throw new Error("FORBIDDEN");
    }
    where.programme = { department: { facultyId: admin.facultyId } };
  }

  const classReps = await prisma.classRep.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, email: true, regNumber: true } },
      programme: { select: { id: true, name: true, level: true } },
      semester: { select: { id: true, name: true } },
      assigner: { select: { id: true, name: true } },
    },
    orderBy: { assignedAt: "desc" },
  });

  res.json({ classReps });
});

router.post("/", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const data = assignClassRepSchema.parse(req.body);

  const [student, programme, semester] = await Promise.all([
    prisma.user.findUnique({ where: { id: data.studentId } }),
    prisma.programme.findUnique({ where: { id: data.programmeId } }),
    prisma.semester.findUnique({ where: { id: data.semesterId } }),
  ]);

  if (!student) throw new Error("NOT_FOUND");
  if (!programme) throw new Error("NOT_FOUND");
  if (!semester) throw new Error("NOT_FOUND");

  if (student.role !== "STUDENT") {
    return res.status(400).json({ error: "Assigned user must be a student" });
  }

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    const dept = await prisma.department.findUnique({ where: { id: programme.departmentId } });
    if (!admin?.facultyId || !dept || dept.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  const existingRep = await prisma.classRep.findUnique({
    where: {
      programmeId_yearOfStudy_semesterId: {
        programmeId: data.programmeId,
        yearOfStudy: data.yearOfStudy,
        semesterId: data.semesterId,
      },
    },
  });
  if (existingRep) {
    return res.status(409).json({ error: "A class rep is already assigned for this programme, year, and semester" });
  }

  const classRep = await prisma.classRep.create({
    data: {
      studentId: data.studentId,
      programmeId: data.programmeId,
      yearOfStudy: data.yearOfStudy,
      semesterId: data.semesterId,
      assignedBy: req.user!.userId,
    },
    include: {
      student: { select: { id: true, name: true, email: true, regNumber: true } },
      programme: { select: { id: true, name: true, level: true } },
      semester: { select: { id: true, name: true } },
      assigner: { select: { id: true, name: true } },
    },
  });

  res.status(201).json({ classRep });
});

router.delete("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const existing = await prisma.classRep.findUnique({
    where: { id },
    include: { programme: { include: { department: true } } },
  });
  if (!existing) throw new Error("NOT_FOUND");

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    if (!admin?.facultyId || existing.programme.department.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  await prisma.classRep.delete({ where: { id } });
  res.json({ message: "Class rep assignment removed" });
});

export default router;
