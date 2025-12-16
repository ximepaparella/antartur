/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar tokens con refresh token
 *     tags: [Auth]
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
 *     responses:
 *       200:
 *         description: Tokens renovados
 *       401:
 *         description: Refresh token inválido o expirado
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
