import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { createCourseOfferingSchema, updateCourseOfferingSchema } from "../validations/course-offering.schema";

const router = Router();

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
    where.course = { department: { facultyId: admin.facultyId } };
  }

  const courseOfferings = await prisma.courseOffering.findMany({
    where,
    include: {
      course: { select: { id: true, code: true, title: true } },
      programme: { select: { id: true, name: true, level: true } },
      semester: { select: { id: true, name: true, academicYearId: true } },
      lecturer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ courseOfferings });
});

router.post("/", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const data = createCourseOfferingSchema.parse(req.body);

  const [course, programme, semester, lecturer] = await Promise.all([
    prisma.course.findUnique({ where: { id: data.courseId } }),
    prisma.programme.findUnique({ where: { id: data.programmeId } }),
    prisma.semester.findUnique({ where: { id: data.semesterId } }),
    prisma.user.findUnique({ where: { id: data.lecturerId } }),
  ]);

  if (!course) throw new Error("NOT_FOUND");
  if (!programme) throw new Error("NOT_FOUND");
  if (!semester) throw new Error("NOT_FOUND");
  if (!lecturer) throw new Error("NOT_FOUND");

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    const dept = await prisma.department.findUnique({ where: { id: course.departmentId } });
    if (!admin?.facultyId || !dept || dept.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  const existing = await prisma.courseOffering.findFirst({
    where: {
      courseId: data.courseId,
      programmeId: data.programmeId,
      yearOfStudy: data.yearOfStudy,
      semesterId: data.semesterId,
    },
  });
  if (existing) {
    return res.status(409).json({ error: "Course offering already exists for this combination" });
  }

  const courseOffering = await prisma.courseOffering.create({
    data,
    include: {
      course: { select: { id: true, code: true, title: true } },
      programme: { select: { id: true, name: true } },
      semester: { select: { id: true, name: true } },
      lecturer: { select: { id: true, name: true, email: true } },
    },
  });

  res.status(201).json({ courseOffering });
});

router.put("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const data = updateCourseOfferingSchema.parse(req.body);

  const existing = await prisma.courseOffering.findUnique({
    where: { id },
    include: { course: true },
  });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    const dept = await prisma.department.findUnique({ where: { id: existing.course.departmentId } });
    if (!admin?.facultyId || !dept || dept.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  if (data.courseId) {
    const course = await prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) throw new Error("NOT_FOUND");

    if (req.user!.role === "ADMIN") {
      const admin = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { facultyId: true },
      });
      const dept = await prisma.department.findUnique({ where: { id: course.departmentId } });
      if (!admin?.facultyId || !dept || dept.facultyId !== admin.facultyId) {
        throw new Error("FORBIDDEN");
      }
    }
  }

  if (data.programmeId) {
    const programme = await prisma.programme.findUnique({ where: { id: data.programmeId } });
    if (!programme) throw new Error("NOT_FOUND");
  }

  if (data.semesterId) {
    const semester = await prisma.semester.findUnique({ where: { id: data.semesterId } });
    if (!semester) throw new Error("NOT_FOUND");
  }

  if (data.lecturerId) {
    const lecturer = await prisma.user.findUnique({ where: { id: data.lecturerId } });
    if (!lecturer) throw new Error("NOT_FOUND");
  }

  const courseOffering = await prisma.courseOffering.update({
    where: { id },
    data,
    include: {
      course: { select: { id: true, code: true, title: true } },
      programme: { select: { id: true, name: true } },
      semester: { select: { id: true, name: true } },
      lecturer: { select: { id: true, name: true, email: true } },
    },
  });

  res.json({ courseOffering });
});

router.delete("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const existing = await prisma.courseOffering.findUnique({
    where: { id },
    include: { course: true },
  });
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    const dept = await prisma.department.findUnique({ where: { id: existing.course.departmentId } });
    if (!admin?.facultyId || !dept || dept.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  await prisma.courseOffering.delete({ where: { id } });
  res.json({ message: "Course offering deleted" });
});

export default router;
