/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar access token con refresh token
 *     tags: [Auth]
 *     description: Renueva el access token usando un refresh token válido. El refresh token también se puede enviar en cookies httpOnly.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token obtenido del login
 *     responses:
 *       200:
 *         description: Tokens renovados exitosamente
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
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Refresh token inválido o expirado
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
 *                   example: "Refresh token inválido o expirado"
 */

import { NextRequest } from "next/server";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";
import { ValidationError } from "@/lib/api/errorHandler";
import { refresh } from "@/modules/auth/domain/authService";

export const POST = withRateLimitHandler(
  "auth",
  withControllerErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const { refreshToken } = body;

    // Validar input
    if (!refreshToken || typeof refreshToken !== "string") {
      throw new ValidationError("Refresh token es requerido");
    }

    const result = await refresh(refreshToken);

    return successResponse(result);
  })
);
