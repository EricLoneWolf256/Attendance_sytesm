import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { getParam } from "../utils/params";
import { Role } from "@prisma/client";

const router = Router();

router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        studentProfile: true,
        lecturerProfile: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/", authenticate, authorize(Role.ADMIN), async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/students", authenticate, authorize(Role.ADMIN, Role.LECTURER), async (_req: AuthRequest, res: Response) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: Role.STUDENT },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        studentProfile: { include: { program: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: students });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/lecturers", authenticate, authorize(Role.ADMIN), async (_req: AuthRequest, res: Response) => {
  try {
    const lecturers = await prisma.user.findMany({
      where: { role: Role.LECTURER },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lecturerProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: lecturers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/:id", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: getParam(req.params.id) },
      data: { firstName, lastName, isActive },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
