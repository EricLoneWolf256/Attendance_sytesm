import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { createDepartmentSchema, updateDepartmentSchema } from "../validations/department.schema";

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
    where.facultyId = admin.facultyId;
  }

  const departments = await prisma.department.findMany({
    where,
    include: { faculty: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json({ departments });
});

router.post("/", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const data = createDepartmentSchema.parse(req.body);

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    if (!admin?.facultyId) {
      throw new Error("FORBIDDEN");
    }
    if (data.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  const faculty = await prisma.faculty.findUnique({ where: { id: data.facultyId } });
  if (!faculty) {
    throw new Error("NOT_FOUND");
  }

  const existing = await prisma.department.findFirst({
    where: { name: data.name, facultyId: data.facultyId },
  });
  if (existing) {
    return res.status(409).json({ error: "Department name already exists in this faculty" });
  }

  const department = await prisma.department.create({
    data,
    include: { faculty: { select: { id: true, name: true } } },
  });

  res.status(201).json({ department });
});

router.put("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = updateDepartmentSchema.parse(req.body);

  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    if (!admin?.facultyId || existing.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
    if (data.facultyId && data.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  if (data.facultyId) {
    const faculty = await prisma.faculty.findUnique({ where: { id: data.facultyId } });
    if (!faculty) {
      throw new Error("NOT_FOUND");
    }
  }

  const department = await prisma.department.update({
    where: { id },
    data,
    include: { faculty: { select: { id: true, name: true } } },
  });

  res.json({ department });
});

router.delete("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    if (!admin?.facultyId || existing.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  await prisma.department.delete({ where: { id } });
  res.json({ message: "Department deleted" });
});

export default router;
