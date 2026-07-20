import { Router, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema } from "../validations/auth.schema";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const { user, token } = await AuthService.register(data);

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(201).json({ user });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "EMAIL_EXISTS") {
        return res.status(409).json({ error: "Email already registered" });
      }
    }
    throw err;
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const { user, token } = await AuthService.login(data);

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ user });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      if (err.message === "ACCOUNT_SUSPENDED") {
        return res.status(403).json({ error: "Account has been suspended" });
      }
    }
    throw err;
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.json({ message: "Logged out" });
});

router.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const user = await AuthService.getProfile(req.user!.userId);
    res.json({ user });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return res.status(404).json({ error: "User not found" });
    }
    throw err;
  }
});

export default router;
