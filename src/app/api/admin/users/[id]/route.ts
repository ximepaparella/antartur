/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Admin Users]
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { noContentResponse } from "@/lib/api/response";
import { ConflictError, NotFoundError } from "@/lib/api/errorHandler";

const userIdParamSchema = /^[a-zA-Z0-9_-]+$/;

export const DELETE = withAuth(
  withRateLimitHandler(
    "admin",
    withControllerErrorHandler(async (_request: NextRequest, context) => {
      const params = await context.params;
      const id = params.id;

      if (!id || !userIdParamSchema.test(id)) {
        throw new NotFoundError("User", id);
      }

      const target = await prisma.user.findUnique({
        where: { id },
        select: { id: true, role: true, isActive: true },
      });

      if (!target) {
        throw new NotFoundError("User", id);
      }

      // Seguridad: no dejar sin administradores activos
      if (target.role === "ADMIN" && target.isActive) {
        const activeAdminCount = await prisma.user.count({
          where: { role: "ADMIN", isActive: true },
        });
        if (activeAdminCount <= 1) {
          throw new ConflictError("Cannot delete the last active admin user");
        }
      }

      await prisma.user.delete({ where: { id } });
      return noContentResponse();
    })
  ),
  { roles: ["ADMIN"] }
);

