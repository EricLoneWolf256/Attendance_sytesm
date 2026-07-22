import bcrypt from "bcrypt";
import { AuditAction } from "@prisma/client";
import { UsersRepository } from "./users.repository";
import {
  CreateUserInput,
  UpdateUserInput,
  UpdateStatusInput,
  UpdateRoleInput,
  ListUsersQuery,
} from "./users.validation";
import { PaginatedUsers, AuditContext, UserWithRelations } from "./users.types";
import { ApiError } from "../../utils/ApiError";
import { config } from "../../config";

const repository = new UsersRepository();

export class UsersService {
  static async list(query: ListUsersQuery): Promise<PaginatedUsers> {
    const { users, total } = await repository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      users: users as UserWithRelations[],
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }

  static async getById(id: string): Promise<UserWithRelations> {
    const user = await repository.findById(id);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return user as UserWithRelations;
  }

  static async create(
    data: CreateUserInput,
    ctx: AuditContext
  ): Promise<UserWithRelations> {
    const existing = await repository.findByEmail(data.email);
    if (existing) {
      throw ApiError.conflict("Email already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, config.bcrypt.saltRounds);
    const user = await repository.create(data, passwordHash);

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.CREATE,
        entityType: "User",
        entityId: user.id,
        afterJson: user as unknown as Record<string, unknown>,
      },
      ctx
    );

    return user as UserWithRelations;
  }

  static async update(
    id: string,
    data: UpdateUserInput,
    ctx: AuditContext
  ): Promise<UserWithRelations> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("User not found");
    }

    if (data.email && data.email !== existing.email) {
      const emailTaken = await repository.findByEmail(data.email);
      if (emailTaken) {
        throw ApiError.conflict("Email already in use");
      }
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const user = await repository.update(id, data);
    const afterSnapshot = user as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "User",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return user as UserWithRelations;
  }

  static async updateStatus(
    id: string,
    data: UpdateStatusInput,
    ctx: AuditContext
  ): Promise<UserWithRelations> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("User not found");
    }

    if (existing.status === data.status) {
      throw ApiError.badRequest(`User already has status "${data.status}"`);
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const user = await repository.updateStatus(id, data.status);
    const afterSnapshot = user as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "User",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return user as UserWithRelations;
  }

  static async updateRole(
    id: string,
    data: UpdateRoleInput,
    ctx: AuditContext
  ): Promise<UserWithRelations> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("User not found");
    }

    if (existing.role === data.role) {
      throw ApiError.badRequest(`User already has role "${data.role}"`);
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const user = await repository.updateRole(id, data.role);
    const afterSnapshot = user as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.UPDATE,
        entityType: "User",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return user as UserWithRelations;
  }

  static async delete(
    id: string,
    ctx: AuditContext
  ): Promise<{ message: string }> {
    const existing = await repository.findById(id);
    if (!existing) {
      throw ApiError.notFound("User not found");
    }

    if (existing.status === "INACTIVE") {
      throw ApiError.badRequest("User is already deactivated");
    }

    if (ctx.actorId === id) {
      throw ApiError.badRequest("Cannot deactivate your own account");
    }

    const beforeSnapshot = existing as unknown as Record<string, unknown>;
    const user = await repository.softDelete(id);
    const afterSnapshot = user as unknown as Record<string, unknown>;

    await repository.createAuditLog(
      {
        actorId: ctx.actorId,
        action: AuditAction.DELETE,
        entityType: "User",
        entityId: id,
        beforeJson: beforeSnapshot,
        afterJson: afterSnapshot,
      },
      ctx
    );

    return { message: "User deactivated successfully" };
  }
}
