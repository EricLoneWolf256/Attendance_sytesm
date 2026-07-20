import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    const { targetTable, actorId, limit: limitStr } = req.query;

    const where: Record<string, unknown> = {};

    if (targetTable) {
      where.targetTable = targetTable as string;
    }

    if (actorId) {
      where.actorId = actorId as string;
    }

    if (req.user!.role === "ADMIN") {
      const admin = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { facultyId: true },
      });
      if (!admin?.facultyId) {
        throw new Error("FORBIDDEN");
      }

      const facultyUserIds = await prisma.user.findMany({
        where: { facultyId: admin.facultyId },
        select: { id: true },
      });
      where.actorId = { in: facultyUserIds.map((u) => u.id) };
    }

    const take = limitStr ? Math.min(parseInt(limitStr as string, 10), 100) : 50;

    const logs = await prisma.auditLog.findMany({
      where,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        actorId: true,
        action: true,
        targetTable: true,
        targetId: true,
        beforeJson: true,
        afterJson: true,
        createdAt: true,
        actor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({ logs });
  }
);

export default router;
