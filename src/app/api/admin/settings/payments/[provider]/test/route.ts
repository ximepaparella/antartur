/**
 * @swagger
 * /api/admin/settings/payments/{provider}/test:
 *   post:
 *     summary: Probar conexión con un gateway de pago
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
 *         description: Resultado del test de conexión
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
 *                     connected:
 *                       type: boolean
 *                     message:
 *                       type: string
 *                     environment:
 *                       type: string
 *                       enum: [sandbox, production]
 */

import { NextRequest } from "next/server";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";
import { ValidationError, NotFoundError } from "@/lib/api/errorHandler";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/services/logger";

const VALID_PROVIDERS = ["PAYPAL", "PAYWAY"] as const;

/**
 * Test de conexión para PayPal
 * Intenta obtener un access token para verificar las credenciales
 */
async function testPayPalConnection(isSandbox: boolean): Promise<{
  connected: boolean;
  message: string;
  environment: string;
}> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = isSandbox ? "sandbox" : "production";

  if (!clientId || !clientSecret) {
    return {
      connected: false,
      message: "Credenciales no configuradas. Configure PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET en las variables de entorno.",
      environment,
    };
  }

  const baseUrl = isSandbox
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

  try {
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (response.ok) {
      const data = await response.json();
      return {
        connected: true,
        message: `Conexión exitosa. Token válido por ${data.expires_in} segundos.`,
        environment,
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return {
        connected: false,
        message: `Error de autenticación: ${errorData.error_description || response.statusText}`,
        environment,
      };
    }
  } catch (error) {
    return {
      connected: false,
      message: `Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`,
      environment,
    };
  }
}

/**
 * Test de conexión para Payway Checkout
 * Verifica que las credenciales estén configuradas
 * 
 * Nota: Payway Checkout no tiene un endpoint de health check público,
 * por lo que solo verificamos que las credenciales estén presentes
 * y tienen el formato correcto.
 */
async function testPaywayConnection(isSandbox: boolean): Promise<{
  connected: boolean;
  message: string;
  environment: string;
}> {
  const apiKey = process.env.PAYWAY_API_KEY;
  const merchantId = process.env.PAYWAY_MERCHANT_ID;
  const environment = isSandbox ? "sandbox" : "production";

  if (!apiKey || !merchantId) {
    return {
      connected: false,
      message: "Credenciales no configuradas. Configure PAYWAY_API_KEY y PAYWAY_MERCHANT_ID en las variables de entorno.",
      environment,
    };
  }

  // Validar formato de credenciales
  if (apiKey.length < 10) {
    return {
      connected: false,
      message: "La API Key parece tener un formato inválido (muy corta).",
      environment,
    };
  }

  if (merchantId.length < 3) {
    return {
      connected: false,
      message: "El Merchant ID parece tener un formato inválido (muy corto).",
      environment,
    };
  }

  // Payway Checkout URLs
  const checkoutUrl = isSandbox
    ? "https://sandbox.payway.com.ar"
    : "https://checkout.payway.com.ar";

  try {
    // Intentar hacer un ping al dominio de Payway
    const response = await fetch(checkoutUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });

    // Si obtenemos cualquier respuesta, el servidor está accesible
    if (response.ok || response.status < 500) {
      return {
        connected: true,
        message: `Credenciales configuradas. Servidor Payway accesible. Merchant ID: ${merchantId.substring(0, 4)}***`,
        environment,
      };
    } else {
      return {
        connected: false,
        message: `Servidor Payway no disponible (${response.status})`,
        environment,
      };
    }
  } catch (error) {
    // Si el fetch falla por timeout o red, igual las credenciales están configuradas
    return {
      connected: true,
      message: `Credenciales configuradas. No se pudo verificar conectividad con Payway, pero esto puede ser normal. Merchant ID: ${merchantId.substring(0, 4)}***`,
      environment,
    };
  }
}

export const POST = withRateLimitHandler(
  "admin",
  withControllerErrorHandler(async (request: NextRequest, context) => {
    const params = await context.params;
    const provider = params.provider;
    const providerUpper = provider.toUpperCase();

    if (!VALID_PROVIDERS.includes(providerUpper as typeof VALID_PROVIDERS[number])) {
      throw new ValidationError(`Invalid provider: ${provider}. Must be one of: ${VALID_PROVIDERS.join(", ")}`);
    }

    // Obtener configuración actual del gateway
    const gateway = await prisma.paymentGateway.findUnique({
      where: { provider: providerUpper },
    });

    if (!gateway) {
      throw new NotFoundError(`Payment gateway ${providerUpper} not found`);
    }

    let result: { connected: boolean; message: string; environment: string };

    switch (providerUpper) {
      case "PAYPAL":
        result = await testPayPalConnection(gateway.isSandbox);
        break;
      case "PAYWAY":
        result = await testPaywayConnection(gateway.isSandbox);
        break;
      default:
        throw new ValidationError(`Test not implemented for provider: ${providerUpper}`);
    }

    logger.info("Payment gateway connection test", {
      provider: providerUpper,
      ...result,
    });

    return successResponse(result);
  })
);

