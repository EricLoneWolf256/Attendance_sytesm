import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { getParam } from "../utils/params";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const faculties = await prisma.faculty.findMany({
      include: { departments: true },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: faculties });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code } = req.body;
    const faculty = await prisma.faculty.create({ data: { name, code } });
    res.status(201).json({ success: true, data: faculty });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put("/:id", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code } = req.body;
    const faculty = await prisma.faculty.update({
      where: { id: getParam(req.params.id) },
      data: { name, code },
    });
    res.json({ success: true, data: faculty });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete("/:id", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.faculty.delete({ where: { id: getParam(req.params.id) } });
    res.json({ success: true, message: "Faculty deleted" });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
