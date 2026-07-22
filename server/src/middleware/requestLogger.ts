import { Request, Response } from "express";
import morgan from "morgan";

export const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    skip: (_req: Request, res: Response) =>
      process.env.NODE_ENV === "production" && res.statusCode < 400,
  }
);
