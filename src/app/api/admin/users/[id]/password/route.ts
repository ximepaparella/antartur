/**
 * @swagger
 * /api/admin/users/{id}/password:
 *   patch:
 *     summary: Cambiar contraseña de usuario
 *     tags: [Admin Users]
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";
import { NotFoundError } from "@/lib/api/errorHandler";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";
import { logoutAll } from "@/modules/auth/domain/authService";

const passwordSchema = z
  .object({
    newPassword: z.string().min(8).max(128),
    confirmNewPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
  });

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export const PATCH = withAuth(
  withRateLimitHandler(
    "admin",
    withControllerErrorHandler(async (request: NextRequest, context) => {
      const params = await context.params;
      const id = params.id;

      if (!id) {
        throw new NotFoundError("User", id);
      }

      const body = await request.json();
      const cleanedBody = Object.fromEntries(
        Object.entries(body).map(([key, value]) => [
          key,
          typeof value === "string" && value.trim() === "" ? undefined : value,
        ])
      );

      const validated = passwordSchema.parse(cleanedBody);

      const existing = await prisma.user.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!existing) {
        throw new NotFoundError("User", id);
      }

      const passwordHash = await hashPassword(validated.newPassword);

      await prisma.user.update({
        where: { id },
        data: { passwordHash },
      });

      // Invalida refresh tokens para cortar sesiones no renovadas.
      await logoutAll(id);

      const updated = await prisma.user.findUnique({
        where: { id },
        select: userSelect,
      });

      return successResponse(updated);
    })
  ),
  { roles: ["ADMIN"] }
);

