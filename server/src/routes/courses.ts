import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { createCourseSchema, updateCourseSchema } from "../validations/course.schema";

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

  const courses = await prisma.course.findMany({
    where,
    include: { department: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json({ courses });
});

router.post("/", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const data = createCourseSchema.parse(req.body);

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

  const existing = await prisma.course.findUnique({ where: { code: data.code } });
  if (existing) {
    return res.status(409).json({ error: "Course code already exists" });
  }

  const course = await prisma.course.create({
    data,
    include: { department: { select: { id: true, name: true } } },
  });

  res.status(201).json({ course });
});

router.put("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = updateCourseSchema.parse(req.body);

  const existing = await prisma.course.findUnique({
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

  if (data.code && data.code !== existing.code) {
    const codeExists = await prisma.course.findUnique({ where: { code: data.code } });
    if (codeExists) {
      return res.status(409).json({ error: "Course code already exists" });
    }
  }

  const course = await prisma.course.update({
    where: { id },
    data,
    include: { department: { select: { id: true, name: true } } },
  });

  res.json({ course });
});

router.delete("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const existing = await prisma.course.findUnique({
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

  await prisma.course.delete({ where: { id } });
  res.json({ message: "Course deleted" });
});

export default router;
