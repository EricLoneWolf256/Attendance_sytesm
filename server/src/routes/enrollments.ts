import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { createEnrollmentSchema, bulkEnrollmentSchema } from "../validations/user.schema";

const router = Router();

router.get("/", authenticate, authorize("SUPER_ADMIN", "ADMIN", "LECTURER"), async (req: Request, res: Response) => {
  const where: Record<string, unknown> = {};

  if (req.query.courseOfferingId) {
    where.courseOfferingId = req.query.courseOfferingId as string;
  }

  if (req.query.studentId) {
    where.studentId = req.query.studentId as string;
  }

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    if (!admin?.facultyId) {
      throw new Error("FORBIDDEN");
    }
    where.courseOffering = {
      course: { department: { facultyId: admin.facultyId } },
    };
  }

  if (req.user!.role === "LECTURER") {
    const base = (where.courseOffering as Record<string, unknown>) || {};
    where.courseOffering = {
      ...base,
      lecturerId: req.user!.userId,
    };
  }

  const enrollments = await prisma.enrollment.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, email: true, regNumber: true } },
      courseOffering: {
        include: {
          course: { select: { id: true, code: true, title: true } },
          programme: { select: { id: true, name: true } },
          semester: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  res.json({ enrollments });
});

router.post("/", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const data = createEnrollmentSchema.parse(req.body);

  const [student, courseOffering] = await Promise.all([
    prisma.user.findUnique({ where: { id: data.studentId } }),
    prisma.courseOffering.findUnique({
      where: { id: data.courseOfferingId },
      include: { course: true },
    }),
  ]);

  if (!student) throw new Error("NOT_FOUND");
  if (!courseOffering) throw new Error("NOT_FOUND");

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    const dept = await prisma.department.findUnique({ where: { id: courseOffering.course.departmentId } });
    if (!admin?.facultyId || !dept || dept.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  const existing = await prisma.enrollment.findUnique({
    where: {
      studentId_courseOfferingId: {
        studentId: data.studentId,
        courseOfferingId: data.courseOfferingId,
      },
    },
  });
  if (existing) {
    return res.status(409).json({ error: "Student already enrolled in this course offering" });
  }

  const enrollment = await prisma.enrollment.create({
    data,
    include: {
      student: { select: { id: true, name: true, email: true, regNumber: true } },
      courseOffering: {
        include: {
          course: { select: { id: true, code: true, title: true } },
          programme: { select: { id: true, name: true } },
        },
      },
    },
  });

  res.status(201).json({ enrollment });
});

router.post("/bulk", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const data = bulkEnrollmentSchema.parse(req.body);

  const courseOffering = await prisma.courseOffering.findUnique({
    where: { id: data.courseOfferingId },
    include: { course: true },
  });
  if (!courseOffering) throw new Error("NOT_FOUND");

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    const dept = await prisma.department.findUnique({ where: { id: courseOffering.course.departmentId } });
    if (!admin?.facultyId || !dept || dept.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  const existingEnrollments = await prisma.enrollment.findMany({
    where: {
      courseOfferingId: data.courseOfferingId,
      studentId: { in: data.studentIds },
    },
    select: { studentId: true },
  });

  const existingIds = new Set(existingEnrollments.map((e) => e.studentId));
  const newStudentIds = data.studentIds.filter((id) => !existingIds.has(id));

  if (newStudentIds.length === 0) {
    return res.status(409).json({ error: "All students are already enrolled in this course offering" });
  }

  const result = await prisma.enrollment.createMany({
    data: newStudentIds.map((studentId) => ({
      studentId,
      courseOfferingId: data.courseOfferingId,
    })),
  });

  res.status(201).json({
    message: `${result.count} student(s) enrolled successfully`,
    skipped: existingIds.size,
  });
});

router.delete("/:id", authenticate, authorize("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const existing = await prisma.enrollment.findUnique({
    where: { id },
    include: { courseOffering: { include: { course: true } } },
  });
  if (!existing) throw new Error("NOT_FOUND");

  if (req.user!.role === "ADMIN") {
    const admin = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { facultyId: true },
    });
    const dept = await prisma.department.findUnique({ where: { id: existing.courseOffering.course.departmentId } });
    if (!admin?.facultyId || !dept || dept.facultyId !== admin.facultyId) {
      throw new Error("FORBIDDEN");
    }
  }

  await prisma.enrollment.delete({ where: { id } });
  res.json({ message: "Enrollment removed" });
});

export default router;
