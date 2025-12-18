/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener usuario actual
 *     tags: [Auth]
 *     description: Obtiene la información del usuario autenticado actual. Requiere token JWT válido.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado o token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "No autenticado"
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
