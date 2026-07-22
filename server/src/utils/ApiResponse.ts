import { Response } from "express";

export class ApiResponse {
  static success(res: Response, data: unknown, statusCode = 200): void {
    res.status(statusCode).json({
      success: true,
      data,
    });
  }

  static created(res: Response, data: unknown): void {
    ApiResponse.success(res, data, 201);
  }

  static noContent(res: Response): void {
    res.status(204).end();
  }

  static error(res: Response, message: string, statusCode = 500): void {
    res.status(statusCode).json({
      success: false,
      error: message,
    });
  }
}
