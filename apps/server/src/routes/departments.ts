import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { getParam } from "../utils/params";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: { faculty: true, programs: true },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: departments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, facultyId } = req.body;
    const department = await prisma.department.create({
      data: { name, code, facultyId },
    });
    res.status(201).json({ success: true, data: department });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put("/:id", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, facultyId } = req.body;
    const department = await prisma.department.update({
      where: { id: getParam(req.params.id) },
      data: { name, code, facultyId },
    });
    res.json({ success: true, data: department });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete("/:id", authenticate, authorize(Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.department.delete({ where: { id: getParam(req.params.id) } });
    res.json({ success: true, message: "Department deleted" });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
