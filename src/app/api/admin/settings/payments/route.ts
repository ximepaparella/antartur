/**
 * @swagger
 * /api/admin/settings/payments:
 *   get:
 *     summary: Obtener configuración de todos los gateways de pago
 *     tags: [Admin Settings]
 *     responses:
 *       200:
 *         description: Lista de gateways obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       provider:
 *                         type: string
 *                       displayName:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       isSandbox:
 *                         type: boolean
 *                       currency:
 *                         type: string
 *                       hasCredentials:
 *                         type: boolean
 */

import { NextRequest } from "next/server";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";
import { prisma } from "@/lib/db";

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

export const GET = withRateLimitHandler(
  "admin",
  withControllerErrorHandler(async (request: NextRequest, context) => {
    // TODO: [SECURITY] Add authentication check when auth system is implemented
    // This endpoint exposes payment gateway configuration and MUST be protected
    // by admin role verification. Currently relies only on rate limiting.
    // When auth is available:
    //   const session = await getServerSession(authOptions);
    //   if (!session?.user?.role === 'admin') {
    //     return errorResponse("Unauthorized", 401);
    //   }

    const gateways = await prisma.paymentGateway.findMany({
      orderBy: { provider: "asc" },
    });

    // Enriquecer con información de credenciales
    const enrichedGateways = gateways.map((gateway) => ({
      id: gateway.id,
      provider: gateway.provider,
      displayName: gateway.displayName,
      isActive: gateway.isActive,
      isSandbox: gateway.isSandbox,
      currency: gateway.currency,
      config: gateway.config,
      hasCredentials: checkGatewayCredentials(gateway.provider),
      updatedAt: gateway.updatedAt,
    }));

    return successResponse(enrichedGateways);
  })
);

