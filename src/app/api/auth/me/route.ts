/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener usuario actual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: No autenticado
 */

import { NextRequest } from "next/server";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { successResponse } from "@/lib/api/response";
import { UnauthorizedError } from "@/lib/api/errorHandler";
import { withAuth, getUserFromRequest } from "@/lib/auth";
import { getCurrentUser } from "@/modules/auth/domain/authService";

export const GET = withAuth(
  withControllerErrorHandler(async (request: NextRequest) => {
    const authUser = getUserFromRequest(request);
    
    if (!authUser) {
      throw new UnauthorizedError("No autenticado");
    }

    const user = await getCurrentUser(authUser.id);
    
    if (!user) {
      throw new UnauthorizedError("Usuario no encontrado o inactivo");
    }

    return successResponse({
      user,
    });
  })
);
