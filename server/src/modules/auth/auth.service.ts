import bcrypt from "bcrypt";
import { UserStatus } from "@prisma/client";
import { AuthRepository } from "./auth.repository";
import { RegisterInput, LoginInput } from "./auth.validation";
import { SafeUser, UserProfile } from "./auth.types";
import { generateAccessToken, generateRefreshToken } from "../../utils/tokens";
import { ApiError } from "../../utils/ApiError";
import { AuthPayload } from "../../middleware/auth";
import { config } from "../../config";

const repository = new AuthRepository();

export class AuthService {
  static async register(data: RegisterInput): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
    const existing = await repository.findByEmail(data.email);
    if (existing) {
      throw ApiError.conflict("Email already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, config.bcrypt.saltRounds);

    const user = await repository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      gender: data.gender,
      campusId: data.campusId,
      role: "STUDENT",
      status: UserStatus.ACTIVE,
    });

    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await repository.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { user, accessToken, refreshToken };
  }

  static async login(
    data: LoginInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
    const user = await repository.findByEmail(data.email);
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
      throw ApiError.forbidden("Account has been suspended");
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await Promise.all([
      repository.createRefreshToken({
        userId: user.id,
        token: refreshToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }),
      repository.updateLastLogin(user.id),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return { user: safeUser as SafeUser, accessToken, refreshToken };
  }

  static async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const session = await repository.findRefreshToken(refreshToken);

    if (!session || !session.isActive) {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    if (new Date() > session.expiresAt) {
      throw ApiError.unauthorized("Refresh token expired");
    }

    const payload: AuthPayload = {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await Promise.all([
      repository.revokeRefreshToken(refreshToken),
      repository.createRefreshToken({
        userId: session.user.id,
        token: newRefreshToken,
        ipAddress: session.ipAddress ?? undefined,
        userAgent: session.userAgent ?? undefined,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }),
    ]);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  static async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await repository.revokeRefreshToken(refreshToken);
    }
  }

  static async getProfile(userId: string): Promise<UserProfile> {
    const user = await repository.findByIdWithRelations(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return user as UserProfile;
  }
}
