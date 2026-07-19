import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { getParam } from "../utils/params";
import { Role, AttendanceStatus } from "@prisma/client";

const router = Router();

router.get("/dashboard", authenticate, authorize(Role.ADMIN, Role.LECTURER), async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role === Role.LECTURER) {
      const lecturerProfile = await prisma.lecturerProfile.findUnique({
        where: { userId: req.user.id },
      });
      const courseIds = lecturerProfile
        ? (await prisma.course.findMany({ where: { lecturerId: lecturerProfile.id } })).map(c => c.id)
        : [];

      const totalStudents = await prisma.enrollment.count({
        where: { courseId: { in: courseIds } },
      });

      const totalCourses = courseIds.length;

      const recentAttendance = await prisma.attendanceRecord.findMany({
        where: { courseId: { in: courseIds } },
        take: 10,
        include: {
          student: { include: { user: true } },
          course: true,
        },
        orderBy: { checkedInAt: "desc" },
      });

      return res.json({
        success: true,
        data: { totalStudents, totalCourses, recentAttendance },
      });
    }

    const [totalStudents, totalLecturers, totalCourses, totalFaculties] = await Promise.all([
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.user.count({ where: { role: Role.LECTURER } }),
      prisma.course.count(),
      prisma.faculty.count(),
    ]);

    const recentAttendance = await prisma.attendanceRecord.findMany({
      take: 10,
      include: {
        student: { include: { user: true } },
        course: true,
      },
      orderBy: { checkedInAt: "desc" },
    });

    res.json({
      success: true,
      data: { totalStudents, totalLecturers, totalCourses, totalFaculties, recentAttendance },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/course/:courseId", authenticate, authorize(Role.LECTURER, Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const courseId = getParam(req.params.courseId);
    const { startDate, endDate } = req.query;

    const where: any = { courseId };
    if (startDate && endDate) {
      where.checkedInAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const [totalEnrolled, records, sessions] = await Promise.all([
      prisma.enrollment.count({ where: { courseId } }),
      prisma.attendanceRecord.findMany({
        where,
        include: { student: { include: { user: true } }, qrSession: true },
        orderBy: { checkedInAt: "desc" },
      }),
      prisma.qRSession.findMany({
        where: { courseId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const attendanceByStudent = records.reduce((acc, record) => {
      const studentId = record.studentId;
      if (!acc[studentId]) {
        acc[studentId] = {
          student: record.student,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }
      acc[studentId][record.status.toLowerCase() as keyof typeof acc[typeof studentId]]++;
      return acc;
    }, {} as Record<string, any>);

    res.json({
      success: true,
      data: {
        totalEnrolled,
        totalSessions: sessions.length,
        totalCheckIns: records.length,
        attendanceByStudent: Object.values(attendanceByStudent),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
