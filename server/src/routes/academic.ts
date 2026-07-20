import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

const createYearSchema = z.object({
  label: z.string().min(2, "Label is required"),
  isCurrent: z.boolean().optional(),
});

const updateYearSchema = z.object({
  label: z.string().min(2).optional(),
  isCurrent: z.boolean().optional(),
});

const createSemesterSchema = z.object({
  academicYearId: z.string().min(1, "Academic year is required"),
  name: z.string().min(1, "Name is required"),
  intakeMonth: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateSemesterSchema = z.object({
  isActive: z.boolean().optional(),
});

router.get("/years", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (_req: Request, res: Response) => {
  const years = await prisma.academicYear.findMany({
    include: {
      semesters: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ years });
});

router.post("/years", authenticate, authorize("SUPER_ADMIN"), async (req: Request, res: Response) => {
  const data = createYearSchema.parse(req.body);

  const existing = await prisma.academicYear.findUnique({ where: { label: data.label } });
  if (existing) {
    return res.status(409).json({ error: "Academic year label already exists" });
  }

  if (data.isCurrent) {
    await prisma.academicYear.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });
  }

  const year = await prisma.academicYear.create({ data });
  res.status(201).json({ year });
});

router.put("/years/:id", authenticate, authorize("SUPER_ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = updateYearSchema.parse(req.body);

  const existing = await prisma.academicYear.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");

  if (data.isCurrent) {
    await prisma.academicYear.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });
  }

  const year = await prisma.academicYear.update({ where: { id }, data });
  res.json({ year });
});

router.get("/semesters", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const where: Record<string, unknown> = {};

  if (req.query.academicYearId) {
    where.academicYearId = req.query.academicYearId as string;
  }

  const semesters = await prisma.semester.findMany({
    where,
    include: { academicYear: { select: { id: true, label: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json({ semesters });
});

router.post("/semesters", authenticate, authorize("SUPER_ADMIN"), async (req: Request, res: Response) => {
  const data = createSemesterSchema.parse(req.body);

  const year = await prisma.academicYear.findUnique({ where: { id: data.academicYearId } });
  if (!year) throw new Error("NOT_FOUND");

  const existing = await prisma.semester.findFirst({
    where: { academicYearId: data.academicYearId, name: data.name },
  });
  if (existing) {
    return res.status(409).json({ error: "Semester name already exists for this academic year" });
  }

  if (data.isActive) {
    await prisma.semester.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  const semester = await prisma.semester.create({
    data,
    include: { academicYear: { select: { id: true, label: true } } },
  });

  res.status(201).json({ semester });
});

router.put("/semesters/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = updateSemesterSchema.parse(req.body);

  const existing = await prisma.semester.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");

  if (data.isActive) {
    await prisma.semester.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  const semester = await prisma.semester.update({
    where: { id },
    data,
    include: { academicYear: { select: { id: true, label: true } } },
  });

  res.json({ semester });
});

export default router;
