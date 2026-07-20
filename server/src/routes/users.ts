import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { createUserSchema, updateUserSchema } from "../validations/user.schema";

const router = Router();
const SALT_ROUNDS = 10;

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

  if (req.query.role) {
    where.role = req.query.role as string;
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      regNumber: true,
      staffNumber: true,
      gender: true,
      status: true,
      campusId: true,
      facultyId: true,
      programmeId: true,
      yearOfStudy: true,
      createdAt: true,
      campus: { select: { id: true, name: true } },
      faculty: { select: { id: true, name: true } },
      programme: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ users });
});

router.post("/", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const data = createUserSchema.parse(req.body);

  const campus = await prisma.campus.findUnique({ where: { id: data.campusId } });
  if (!campus) throw new Error("NOT_FOUND");

  if (data.facultyId) {
    const faculty = await prisma.faculty.findUnique({ where: { id: data.facultyId } });
    if (!faculty) throw new Error("NOT_FOUND");

    if (req.user!.role === "ADMIN") {
      const admin = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { facultyId: true },
      });
      if (!admin?.facultyId || data.facultyId !== admin.facultyId) {
        throw new Error("FORBIDDEN");
      }
    }
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      regNumber: data.regNumber,
      staffNumber: data.staffNumber,
      gender: data.gender,
      campusId: data.campusId,
      facultyId: data.facultyId,
      programmeId: data.programmeId,
      yearOfStudy: data.yearOfStudy,
      status: "active",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      regNumber: true,
      staffNumber: true,
      gender: true,
      status: true,
      campusId: true,
      facultyId: true,
      programmeId: true,
      yearOfStudy: true,
      createdAt: true,
    },
  });

  res.status(201).json({ user });
});

router.put("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = updateUserSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");

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

  if (data.email && data.email !== existing.email) {
    const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
    if (emailExists) {
      return res.status(409).json({ error: "Email already registered" });
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      regNumber: true,
      staffNumber: true,
      gender: true,
      status: true,
      campusId: true,
      facultyId: true,
      programmeId: true,
      yearOfStudy: true,
      updatedAt: true,
    },
  });

  res.json({ user });
});

router.put("/:id/deactivate", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    if (!admin?.facultyId || existing.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  if (existing.id === req.user!.userId) {
    return res.status(400).json({ error: "Cannot deactivate your own account" });
  }

  const newStatus = existing.status === "active" ? "suspended" : "active";

  const user = await prisma.user.update({
    where: { id },
    data: { status: newStatus },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  res.json({ user });
});

router.put("/:id/reset-password", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    if (!admin?.facultyId || existing.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  const { password } = req.body;
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });

  res.json({ message: "Password reset successfully" });
});

export default router;
