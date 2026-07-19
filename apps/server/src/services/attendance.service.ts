import prisma from "../lib/prisma";
import { AttendanceStatus } from "@prisma/client";

export class AttendanceService {
  static async checkIn(studentId: string, qrCode: string, ipAddress?: string) {
    const session = await prisma.qRSession.findFirst({
      where: { qrCode, isActive: true },
    });

    if (!session) {
      throw new Error("Invalid QR code");
    }
    if (session.expiresAt < new Date()) {
      throw new Error("QR code has expired");
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId, courseId: session.courseId },
    });
    if (!enrollment) {
      throw new Error("You are not enrolled in this course");
    }

    const existing = await prisma.attendanceRecord.findFirst({
      where: { studentId, qrSessionId: session.id },
    });
    if (existing) {
      throw new Error("Already checked in for this session");
    }

    const record = await prisma.attendanceRecord.create({
      data: {
        studentId,
        courseId: session.courseId,
        qrSessionId: session.id,
        status: AttendanceStatus.PRESENT,
        ipAddress,
      },
      include: {
        course: true,
        student: { include: { user: true } },
      },
    });

    return record;
  }

  static async getCourseAttendance(courseId: string) {
    return prisma.attendanceRecord.findMany({
      where: { courseId },
      include: {
        student: { include: { user: true } },
        qrSession: true,
      },
      orderBy: { checkedInAt: "desc" },
    });
  }

  static async getStudentAttendance(studentId: string) {
    return prisma.attendanceRecord.findMany({
      where: { studentId },
      include: {
        course: true,
        qrSession: true,
      },
      orderBy: { checkedInAt: "desc" },
    });
  }

  static async getAttendanceStats(courseId: string) {
    const totalStudents = await prisma.enrollment.count({
      where: { courseId },
    });

    const totalSessions = await prisma.qRSession.count({
      where: { courseId },
    });

    const presentCount = await prisma.attendanceRecord.count({
      where: { courseId, status: AttendanceStatus.PRESENT },
    });

    return {
      totalStudents,
      totalSessions,
      totalCheckIns: presentCount,
      attendanceRate:
        totalSessions > 0
          ? Math.round((presentCount / (totalStudents * totalSessions)) * 100)
          : 0,
    };
  }
}
