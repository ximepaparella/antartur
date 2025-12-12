/**
 * @swagger
 * /api/admin/settings/payments/{provider}:
 *   get:
 *     summary: Obtener configuración de un gateway específico
 *     tags: [Admin Settings]
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PAYPAL, PAYWAY]
 *     responses:
 *       200:
 *         description: Gateway obtenido exitosamente
 *   patch:
 *     summary: Actualizar configuración de un gateway
 *     tags: [Admin Settings]
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PAYPAL, PAYWAY]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *               isSandbox:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Gateway actualizado exitosamente
 */

import { NextRequest } from "next/server";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";
import { validateBody } from "@/lib/validation/schemas";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/services/logger";
import { z } from "zod";

const VALID_PROVIDERS = ["PAYPAL", "PAYWAY"] as const;

/**
 * Verifica si las credenciales de un gateway están configuradas en .env
 */
function checkGatewayCredentials(provider: string): boolean {
  switch (provider) {
    case "PAYPAL":
      return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
    case "PAYWAY":
      return !!(process.env.PAYWAY_API_KEY && process.env.PAYWAY_MERCHANT_ID);
    default:
      return false;
  }
}

/**
 * Obtiene las credenciales necesarias para un gateway (solo nombres, no valores)
 */
function getRequiredCredentials(provider: string): string[] {
  switch (provider) {
    case "PAYPAL":
      return ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_MODE"];
    case "PAYWAY":
      return ["PAYWAY_API_KEY", "PAYWAY_MERCHANT_ID", "PAYWAY_ENVIRONMENT"];
    default:
      return [];
  }
}

export const GET = withRateLimitHandler(
  "admin",
  withControllerErrorHandler(async (request: NextRequest, context) => {
    const params = await context.params;
    const provider = params.provider;
    const providerUpper = provider.toUpperCase();

    if (!VALID_PROVIDERS.includes(providerUpper as typeof VALID_PROVIDERS[number])) {
      throw new ValidationError(`Invalid provider: ${provider}. Must be one of: ${VALID_PROVIDERS.join(", ")}`);
    }

    const gateway = await prisma.paymentGateway.findUnique({
      where: { provider: providerUpper },
    });

    if (!gateway) {
      throw new NotFoundError(`Payment gateway ${providerUpper} not found`);
    }

    return successResponse({
      id: gateway.id,
      provider: gateway.provider,
      displayName: gateway.displayName,
      isActive: gateway.isActive,
      isSandbox: gateway.isSandbox,
      currency: gateway.currency,
      config: gateway.config,
      hasCredentials: checkGatewayCredentials(gateway.provider),
      requiredCredentials: getRequiredCredentials(gateway.provider),
      updatedAt: gateway.updatedAt,
    });
  })
);

const updateGatewaySchema = z.object({
  isActive: z.boolean().optional(),
  isSandbox: z.boolean().optional(),
  displayName: z.string().min(1).optional(),
  config: z.record(z.unknown()).optional(),
});

export const PATCH = withRateLimitHandler(
  "admin",
  withControllerErrorHandler(async (request: NextRequest, context) => {
    const params = await context.params;
    const provider = params.provider;
    const providerUpper = provider.toUpperCase();

    if (!VALID_PROVIDERS.includes(providerUpper as typeof VALID_PROVIDERS[number])) {
      throw new ValidationError(`Invalid provider: ${provider}. Must be one of: ${VALID_PROVIDERS.join(", ")}`);
    }

    const body = await request.json();
    const data = validateBody(updateGatewaySchema, body);

    // Si se intenta activar, verificar que las credenciales estén configuradas
    if (data.isActive === true && !checkGatewayCredentials(providerUpper)) {
      throw new ValidationError(
        `Cannot activate ${providerUpper}: credentials are not configured. Please set the required environment variables: ${getRequiredCredentials(providerUpper).join(", ")}`
      );
    }

    const gateway = await prisma.paymentGateway.findUnique({
      where: { provider: providerUpper },
    });

    if (!gateway) {
      throw new NotFoundError(`Payment gateway ${providerUpper} not found`);
    }

    const updatedGateway = await prisma.paymentGateway.update({
      where: { provider: providerUpper },
      data: {
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isSandbox !== undefined && { isSandbox: data.isSandbox }),
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.config !== undefined && { config: data.config as object }),
      },
    });

    logger.info("Payment gateway updated", {
      provider: providerUpper,
      isActive: updatedGateway.isActive,
      isSandbox: updatedGateway.isSandbox,
    });

    return successResponse({
      id: updatedGateway.id,
      provider: updatedGateway.provider,
      displayName: updatedGateway.displayName,
      isActive: updatedGateway.isActive,
      isSandbox: updatedGateway.isSandbox,
      currency: updatedGateway.currency,
      config: updatedGateway.config,
      hasCredentials: checkGatewayCredentials(updatedGateway.provider),
      updatedAt: updatedGateway.updatedAt,
    });
  })
);

