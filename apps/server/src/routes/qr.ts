import { Router, Response } from "express";
import { QRService } from "../services/qr.service";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { getParam } from "../utils/params";
import { Role } from "@prisma/client";

const router = Router();

router.post("/start", authenticate, authorize(Role.LECTURER), async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, semesterId } = req.body;
    const session = await QRService.startSession(courseId, semesterId);
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/rotate/:sessionId", authenticate, authorize(Role.LECTURER), async (req: AuthRequest, res: Response) => {
  try {
    const data = await QRService.rotateSession(getParam(req.params.sessionId));
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/stop/:sessionId", authenticate, authorize(Role.LECTURER), async (req: AuthRequest, res: Response) => {
  try {
    await QRService.stopSession(getParam(req.params.sessionId));
    res.json({ success: true, message: "Session stopped" });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get("/current/:courseId", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const session = await QRService.getActiveSession(getParam(req.params.courseId));
    if (!session) {
      return res.json({ success: true, data: null });
    }
    const isExpired = session.expiresAt < new Date();
    res.json({ success: true, data: { ...session, isExpired } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
