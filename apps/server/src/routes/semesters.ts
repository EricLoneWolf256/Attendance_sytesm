import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { getParam } from "../utils/params";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const semesters = await prisma.semester.findMany({
      include: { courses: true },
      orderBy: { startDate: "desc" },
    });
    res.json({ success: true, data: semesters });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/active", async (_req: Request, res: Response) => {
  try {
    const semester = await prisma.semester.findFirst({
      where: { isActive: true },
      include: { courses: true },
    });
    res.json({ success: true, data: semester });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { name, startDate, endDate, isActive } = req.body;
    if (isActive) {
      await prisma.semester.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }
    const semester = await prisma.semester.create({
      data: { name, startDate: new Date(startDate), endDate: new Date(endDate), isActive },
    });
    res.status(201).json({ success: true, data: semester });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put("/:id", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { name, startDate, endDate, isActive } = req.body;
    if (isActive) {
      await prisma.semester.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }
    const semester = await prisma.semester.update({
      where: { id: getParam(req.params.id) },
      data: { name, startDate: new Date(startDate), endDate: new Date(endDate), isActive },
    });
    res.json({ success: true, data: semester });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
