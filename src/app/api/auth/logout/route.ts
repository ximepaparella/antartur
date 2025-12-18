/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión (invalidar refresh token)
 *     tags: [Auth]
 *     description: Invalida el refresh token proporcionado, cerrando la sesión del usuario. Requiere autenticación.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token a invalidar (opcional, también se puede invalidar desde cookies)
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
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
 *                     message:
 *                       type: string
 *                       example: "Sesión cerrada correctamente"
 *       401:
 *         description: No autenticado
 */

import { NextRequest } from "next/server";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { successResponse } from "@/lib/api/response";
import { logout } from "@/modules/auth/domain/authService";

export const POST = withControllerErrorHandler(async (request: NextRequest, context) => {
  const body = await request.json().catch(() => ({}));
  const { refreshToken } = body;

  // Si hay refresh token, invalidarlo
  if (refreshToken && typeof refreshToken === "string") {
    await logout(refreshToken);
  }

  return successResponse({ message: "Sesión cerrada correctamente" });
});
