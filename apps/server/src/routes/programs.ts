import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { getParam } from "../utils/params";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const programs = await prisma.program.findMany({
      include: { department: true, courses: true },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: programs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, departmentId, level } = req.body;
    const program = await prisma.program.create({
      data: { name, code, departmentId, level },
    });
    res.status(201).json({ success: true, data: program });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put("/:id", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, departmentId, level } = req.body;
    const program = await prisma.program.update({
      where: { id: getParam(req.params.id) },
      data: { name, code, departmentId, level },
    });
    res.json({ success: true, data: program });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete("/:id", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.program.delete({ where: { id: getParam(req.params.id) } });
    res.json({ success: true, message: "Program deleted" });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
