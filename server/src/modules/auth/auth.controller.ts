import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions } from "../../utils/tokens";

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await AuthService.register(req.body);

    res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

    ApiResponse.created(res, { user });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const ipAddress = req.ip;
    const userAgent = req.get("User-Agent");

    const { user, accessToken, refreshToken } = await AuthService.login(
      req.body,
      ipAddress,
      userAgent
    );

    res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

    ApiResponse.success(res, { user });
  });

  static refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw ApiError.unauthorized("Refresh token required");
    }

    const { accessToken, refreshToken: newRefreshToken } = await AuthService.refresh(refreshToken);

    res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());

    ApiResponse.success(res, { message: "Token refreshed" });
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    await AuthService.logout(refreshToken);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });

    ApiResponse.success(res, { message: "Logged out successfully" });
  });

  static me = asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.getProfile(req.user!.userId);
    ApiResponse.success(res, { user });
  });
}
