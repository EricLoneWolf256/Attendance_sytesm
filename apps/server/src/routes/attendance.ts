import { Router, Response } from "express";
import { AttendanceService } from "../services/attendance.service";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { getParam } from "../utils/params";
import { Role } from "@prisma/client";
import prisma from "../lib/prisma";

const router = Router();

router.post("/check-in", authenticate, authorize(Role.STUDENT), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const userProfile = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { studentProfile: { select: { id: true } } },
    });
    if (!userProfile?.studentProfile) {
      return res.status(400).json({ error: "No student profile found" });
    }
    const { qrCode } = req.body;
    const record = await AttendanceService.checkIn(userProfile.studentProfile.id, qrCode, req.ip);
    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get("/course/:courseId", authenticate, authorize(Role.LECTURER, Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const records = await AttendanceService.getCourseAttendance(getParam(req.params.courseId));
    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/student/:studentId", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    let studentId = getParam(req.params.studentId);

    if (req.user.role === Role.STUDENT) {
      const userProfile = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { studentProfile: { select: { id: true } } },
      });
      if (!userProfile?.studentProfile) {
        return res.status(400).json({ error: "No student profile found" });
      }
      studentId = userProfile.studentProfile.id;
    }

    const records = await AttendanceService.getStudentAttendance(studentId);
    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/stats/:courseId", authenticate, authorize(Role.LECTURER, Role.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const stats = await AttendanceService.getAttendanceStats(getParam(req.params.courseId));
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
