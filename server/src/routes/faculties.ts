import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { createFacultySchema, updateFacultySchema } from "../validations/faculty.schema";

const router = Router();

router.get("/", authenticate, authorize("SUPER_ADMIN"), async (_req: Request, res: Response) => {
  const faculties = await prisma.faculty.findMany({
    include: { campus: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ faculties });
});

router.post("/", authenticate, authorize("SUPER_ADMIN"), async (req: Request, res: Response) => {
  const data = createFacultySchema.parse(req.body);

  const campus = await prisma.campus.findUnique({ where: { id: data.campusId } });
  if (!campus) {
    throw new Error("NOT_FOUND");
  }

  const existing = await prisma.faculty.findFirst({ where: { name: data.name, campusId: data.campusId } });
  if (existing) {
    return res.status(409).json({ error: "Faculty name already exists in this campus" });
  }

  const faculty = await prisma.faculty.create({
    data,
    include: { campus: { select: { id: true, name: true } } },
  });

  res.status(201).json({ faculty });
});

router.put("/:id", authenticate, authorize("SUPER_ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = updateFacultySchema.parse(req.body);

  const existing = await prisma.faculty.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  if (data.campusId) {
    const campus = await prisma.campus.findUnique({ where: { id: data.campusId } });
    if (!campus) {
      throw new Error("NOT_FOUND");
    }
  }

  const faculty = await prisma.faculty.update({
    where: { id },
    data,
    include: { campus: { select: { id: true, name: true } } },
  });

  res.json({ faculty });
});

router.delete("/:id", authenticate, authorize("SUPER_ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const existing = await prisma.faculty.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  await prisma.faculty.delete({ where: { id } });
  res.json({ message: "Faculty deleted" });
});

export default router;
