/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autenticar usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 *       429:
 *         description: Demasiados intentos
 */

import { NextRequest } from "next/server";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";
import { ValidationError } from "@/lib/api/errorHandler";
import { login } from "@/modules/auth/domain/authService";

export const POST = withRateLimitHandler(
  "auth",
  withControllerErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const { email, password } = body;

    // Validar input
    if (!email || typeof email !== "string") {
      throw new ValidationError("Email es requerido");
    }
    if (!password || typeof password !== "string") {
      throw new ValidationError("Password es requerido");
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Formato de email inválido");
    }

    const result = await login(email, password);

    return successResponse(result);
  })
);
