import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { createCampusSchema, updateCampusSchema } from "../validations/campus.schema";

const router = Router();

router.get("/", authenticate, authorize("SUPER_ADMIN"), async (_req: Request, res: Response) => {
  const campuses = await prisma.campus.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json({ campuses });
});

router.post("/", authenticate, authorize("SUPER_ADMIN"), async (req: Request, res: Response) => {
  const data = createCampusSchema.parse(req.body);

  const existing = await prisma.campus.findUnique({ where: { name: data.name } });
  if (existing) {
    return res.status(409).json({ error: "Campus name already exists" });
  }

  const campus = await prisma.campus.create({ data });
  res.status(201).json({ campus });
});

router.put("/:id", authenticate, authorize("SUPER_ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = updateCampusSchema.parse(req.body);

  const existing = await prisma.campus.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  const campus = await prisma.campus.update({ where: { id }, data });
  res.json({ campus });
});

router.delete("/:id", authenticate, authorize("SUPER_ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const existing = await prisma.campus.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  await prisma.campus.delete({ where: { id } });
  res.json({ message: "Campus deleted" });
});

export default router;
