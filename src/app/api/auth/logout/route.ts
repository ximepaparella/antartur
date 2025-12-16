/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión (invalidar refresh token)
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout exitoso
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
