import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (_req: Request, res: Response) => {
    const policies = await prisma.attendancePolicy.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        programmeId: true,
        minPercentage: true,
        createdAt: true,
        updatedAt: true,
        programme: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({ policies });
  }
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    const { programmeId, minPercentage } = req.body as {
      programmeId?: string;
      minPercentage: number;
    };

    if (minPercentage === undefined || minPercentage < 0 || minPercentage > 100) {
      return res.status(400).json({ error: "minPercentage must be between 0 and 100" });
    }

    if (programmeId) {
      const programme = await prisma.programme.findUnique({ where: { id: programmeId } });
      if (!programme) throw new Error("NOT_FOUND");
    }

    const existing = programmeId
      ? await prisma.attendancePolicy.findFirst({
          where: { programmeId },
        })
      : await prisma.attendancePolicy.findFirst({
          where: { programmeId: null },
        });

    let policy;

    if (existing) {
      policy = await prisma.attendancePolicy.update({
        where: { id: existing.id },
        data: { minPercentage },
        select: {
          id: true,
          programmeId: true,
          minPercentage: true,
          createdAt: true,
          updatedAt: true,
          programme: {
            select: { id: true, name: true },
          },
        },
      });
    } else {
      policy = await prisma.attendancePolicy.create({
        data: {
          programmeId: programmeId || null,
          minPercentage,
        },
        select: {
          id: true,
          programmeId: true,
          minPercentage: true,
          createdAt: true,
          updatedAt: true,
          programme: {
            select: { id: true, name: true },
          },
        },
      });
    }

    res.status(201).json({ policy });
  }
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const existing = await prisma.attendancePolicy.findUnique({ where: { id } });
    if (!existing) throw new Error("NOT_FOUND");

    await prisma.attendancePolicy.delete({ where: { id } });
    res.json({ message: "Policy deleted" });
  }
);

export default router;
