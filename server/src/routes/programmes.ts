import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { createProgrammeSchema, updateProgrammeSchema } from "../validations/programme.schema";

const router = Router();

router.get("/", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const where: Record<string, unknown> = {};

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    if (!admin?.facultyId) {
      throw new Error("FORBIDDEN");
    }
    where.department = { facultyId: admin.facultyId };
  }

  const programmes = await prisma.programme.findMany({
    where,
    include: {
      department: { select: { id: true, name: true, facultyId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ programmes });
});

router.post("/", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const data = createProgrammeSchema.parse(req.body);

  const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
  if (!department) {
    throw new Error("NOT_FOUND");
  }

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    if (!admin?.facultyId || department.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  const existing = await prisma.programme.findFirst({
    where: { name: data.name, departmentId: data.departmentId },
  });
  if (existing) {
    return res.status(409).json({ error: "Programme name already exists in this department" });
  }

  const programme = await prisma.programme.create({
    data,
    include: { department: { select: { id: true, name: true } } },
  });

  res.status(201).json({ programme });
});

router.put("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = updateProgrammeSchema.parse(req.body);

  const existing = await prisma.programme.findUnique({
    where: { id },
    include: { department: true },
  });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    if (!admin?.facultyId || existing.department.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
    if (data.departmentId) {
      const newDept = await prisma.department.findUnique({ where: { id: data.departmentId } });
      if (!newDept || newDept.facultyId !== admin.facultyId) {
        throw new Error("FORBIDDEN");
      }
    }
  }

  if (data.departmentId) {
    const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
    if (!department) {
      throw new Error("NOT_FOUND");
    }
  }

  const programme = await prisma.programme.update({
    where: { id },
    data,
    include: { department: { select: { id: true, name: true } } },
  });

  res.json({ programme });
});

router.delete("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const existing = await prisma.programme.findUnique({
    where: { id },
    include: { department: true },
  });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    if (!admin?.facultyId || existing.department.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  await prisma.programme.delete({ where: { id } });
  res.json({ message: "Programme deleted" });
});

export default router;
