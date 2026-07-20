import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { generateSessionPdf } from "../services/pdf.service";

const router = Router();

router.get(
  "/attendance-summary",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN", "LECTURER"),
  async (req: Request, res: Response) => {
    const { courseOfferingId, programmeId, yearOfStudy, studentId } = req.query;

    const role = req.user!.role;

    const offeringWhere: Record<string, unknown> = {};

    if (courseOfferingId) {
      offeringWhere.id = courseOfferingId as string;
    }

    if (programmeId) {
      offeringWhere.programmeId = programmeId as string;
    }

    if (yearOfStudy) {
      offeringWhere.yearOfStudy = parseInt(yearOfStudy as string, 10);
    }

    if (role === "LECTURER") {
      offeringWhere.lecturerId = req.user!.userId;
    }

    if (role === "ADMIN") {
      const admin = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { facultyId: true },
      });
      if (!admin?.facultyId) throw new Error("FORBIDDEN");
      offeringWhere.course = { department: { facultyId: admin.facultyId } };
    }

    const courseOfferings = await prisma.courseOffering.findMany({
      where: offeringWhere,
      select: { id: true },
    });

    const offeringIds = courseOfferings.map((co) => co.id);

    if (offeringIds.length === 0) {
      return res.json({ summary: [] });
    }

    const sessions = await prisma.classSession.findMany({
      where: { courseOfferingId: { in: offeringIds } },
      select: { id: true, courseOfferingId: true },
    });

    const sessionIds = sessions.map((s) => s.id);

    if (sessionIds.length === 0) {
      return res.json({ summary: [] });
    }

    const attendanceWhere: Record<string, unknown> = {
      sessionId: { in: sessionIds },
    };

    if (studentId) {
      attendanceWhere.studentId = studentId as string;
    }

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: attendanceWhere,
      select: {
        studentId: true,
        sessionId: true,
        status: true,
      },
    });

    const sessionsByOffering = new Map<string, string[]>();
    for (const s of sessions) {
      const existing = sessionsByOffering.get(s.courseOfferingId) || [];
      existing.push(s.id);
      sessionsByOffering.set(s.courseOfferingId, existing);
    }

    const studentStats = new Map<
      string,
      { totalSessions: number; presentCount: number; studentId: string }
    >();

    for (const record of attendanceRecords) {
      const key = record.studentId;
      const existing = studentStats.get(key) || {
        totalSessions: 0,
        presentCount: 0,
        studentId: record.studentId,
      };

      const sessionsForOffering =
        sessionsByOffering.get(
          sessions.find((s) => s.id === record.sessionId)?.courseOfferingId || ""
        ) || [];

      if (!existing.totalSessions) {
        existing.totalSessions = sessionsForOffering.length;
      }

      if (record.status === "present" || record.status === "late") {
        existing.presentCount += 1;
      }

      studentStats.set(key, existing);
    }

    const summary = Array.from(studentStats.values()).map((stat) => ({
      studentId: stat.studentId,
      totalSessions: stat.totalSessions,
      presentCount: stat.presentCount,
      percentage:
        stat.totalSessions > 0
          ? Math.round((stat.presentCount / stat.totalSessions) * 10000) / 100
          : 0,
    }));

    const studentIds = [...new Set(summary.map((s) => s.studentId))];
    const students = await prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, name: true, email: true, regNumber: true },
    });

    const studentMap = new Map(students.map((s) => [s.id, s]));

    const enrichedSummary = summary.map((s) => ({
      ...s,
      student: studentMap.get(s.studentId) || null,
    }));

    res.json({ summary: enrichedSummary });
  }
);

router.get(
  "/below-threshold",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN", "LECTURER"),
  async (req: Request, res: Response) => {
    const { programmeId, threshold } = req.query;

    const role = req.user!.role;

    const offeringWhere: Record<string, unknown> = {};

    if (programmeId) {
      offeringWhere.programmeId = programmeId as string;
    }

    if (role === "LECTURER") {
      offeringWhere.lecturerId = req.user!.userId;
    }

    if (role === "ADMIN") {
      const admin = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { facultyId: true },
      });
      if (!admin?.facultyId) throw new Error("FORBIDDEN");
      offeringWhere.course = { department: { facultyId: admin.facultyId } };
    }

    const courseOfferings = await prisma.courseOffering.findMany({
      where: offeringWhere,
      select: { id: true, programmeId: true },
    });

    const offeringIds = courseOfferings.map((co) => co.id);

    if (offeringIds.length === 0) {
      return res.json({ belowThreshold: [] });
    }

    const sessions = await prisma.classSession.findMany({
      where: { courseOfferingId: { in: offeringIds } },
      select: { id: true, courseOfferingId: true },
    });

    const sessionIds = sessions.map((s) => s.id);

    if (sessionIds.length === 0) {
      return res.json({ belowThreshold: [] });
    }

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { sessionId: { in: sessionIds } },
      select: {
        studentId: true,
        sessionId: true,
        status: true,
      },
    });

    const sessionsByOffering = new Map<string, string[]>();
    for (const s of sessions) {
      const existing = sessionsByOffering.get(s.courseOfferingId) || [];
      existing.push(s.id);
      sessionsByOffering.set(s.courseOfferingId, existing);
    }

    const studentStats = new Map<string, { totalSessions: number; presentCount: number }>();

    for (const record of attendanceRecords) {
      const key = record.studentId;
      const existing = studentStats.get(key) || { totalSessions: 0, presentCount: 0 };

      const coId = sessions.find((s) => s.id === record.sessionId)?.courseOfferingId || "";
      const totalForOffering = (sessionsByOffering.get(coId) || []).length;

      if (existing.totalSessions === 0) {
        existing.totalSessions = totalForOffering;
      }

      if (record.status === "present" || record.status === "late") {
        existing.presentCount += 1;
      }

      studentStats.set(key, existing);
    }

    const policies = await prisma.attendancePolicy.findMany({
      where: programmeId ? { programmeId: programmeId as string } : {},
      select: { programmeId: true, minPercentage: true },
    });

    const policyMap = new Map(
      policies.map((p) => [p.programmeId, Number(p.minPercentage)])
    );

    const defaultThreshold = threshold ? parseFloat(threshold as string) : 75;

    const belowThreshold: Array<{
      studentId: string;
      totalSessions: number;
      presentCount: number;
      percentage: number;
      threshold: number;
    }> = [];

    for (const [studentId, stats] of studentStats) {
      if (stats.totalSessions === 0) continue;

      const percentage =
        Math.round((stats.presentCount / stats.totalSessions) * 10000) / 100;

      const studentOfferings = courseOfferings.filter((co) =>
        sessions.some(
          (s) =>
            s.courseOfferingId === co.id &&
            attendanceRecords.some(
              (ar) => ar.studentId === studentId && ar.sessionId === s.id
            )
        )
      );

      let effectiveThreshold = defaultThreshold;

      for (const co of studentOfferings) {
        const pThreshold = policyMap.get(co.programmeId);
        if (pThreshold !== undefined) {
          effectiveThreshold = pThreshold;
          break;
        }
      }

      if (percentage < effectiveThreshold) {
        belowThreshold.push({
          studentId,
          totalSessions: stats.totalSessions,
          presentCount: stats.presentCount,
          percentage,
          threshold: effectiveThreshold,
        });
      }
    }

    const studentIds = [...new Set(belowThreshold.map((s) => s.studentId))];
    const students = await prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, name: true, email: true, regNumber: true },
    });

    const studentMap = new Map(students.map((s) => [s.id, s]));

    const enriched = belowThreshold.map((s) => ({
      ...s,
      student: studentMap.get(s.studentId) || null,
    }));

    res.json({ belowThreshold: enriched });
  }
);

router.get(
  "/sessions/:id/pdf",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN", "LECTURER"),
  async (req: Request, res: Response) => {
    const sessionId = req.params.id as string;

    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      select: { id: true, date: true },
    });

    if (!session) throw new Error("NOT_FOUND");

    const pdfBuffer = await generateSessionPdf(sessionId);

    const dateStr = session.date.toISOString().split("T")[0];
    const filename = `attendance-register-${dateStr}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  }
);

export default router;
