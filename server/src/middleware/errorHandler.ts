import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error("Error:", err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation error",
      details: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err.message === "UNAUTHORIZED") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (err.message === "FORBIDDEN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (err.message === "NOT_FOUND") {
    return res.status(404).json({ error: "Not found" });
  }

  return res.status(500).json({ error: "Internal server error" });
}
