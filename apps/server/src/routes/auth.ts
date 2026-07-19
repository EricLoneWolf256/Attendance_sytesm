import { Router, Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";
import { authenticate, AuthRequest } from "../middleware/auth";
import { Role } from "@prisma/client";
import prisma from "../lib/prisma";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.nativeEnum(Role),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await AuthService.register(data);
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await AuthService.login(email, password, req.ip);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }
    const tokens = await AuthService.refresh(refreshToken);
    res.json({ success: true, data: tokens });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

router.post("/logout", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    await AuthService.logout(req.user.id);
    res.json({ success: true, message: "Logged out" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
