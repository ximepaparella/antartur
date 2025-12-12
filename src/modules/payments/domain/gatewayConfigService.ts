/**
 * Servicio de configuración de gateways de pago
 * Combina la configuración de la base de datos con las variables de entorno
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/services/logger";

export type PaymentProvider = "PAYPAL" | "PAYWAY";

/** Lista de providers válidos para validación en runtime */
const VALID_PROVIDERS: readonly PaymentProvider[] = ["PAYPAL", "PAYWAY"] as const;

/**
 * Valida si un string es un PaymentProvider válido
 * Fail-closed: valores desconocidos retornan false
 */
function isValidProvider(value: string): value is PaymentProvider {
  return VALID_PROVIDERS.includes(value as PaymentProvider);
}

export interface GatewayConfig {
  provider: PaymentProvider;
  displayName: string;
  isActive: boolean;
  isSandbox: boolean;
  currency: string;
  hasCredentials: boolean;
  config: Record<string, unknown> | null;
}

export interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
  mode: "sandbox" | "live";
}

export interface PaywayCredentials {
  apiKey: string;
  merchantId: string;
  environment: "sandbox" | "production";
}

/**
 * Verifica si las credenciales de un gateway están configuradas
 */
function checkCredentials(provider: PaymentProvider): boolean {
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
 * Obtiene la configuración de un gateway específico
 */
export async function getGatewayConfig(provider: PaymentProvider): Promise<GatewayConfig | null> {
  try {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { provider },
    });

    if (!gateway) {
      logger.warn(`Payment gateway ${provider} not found in database`);
      return null;
    }

    // Validar que el provider en BD sea válido (fail-closed)
    if (!isValidProvider(gateway.provider)) {
      logger.error(`Invalid provider value in database: ${gateway.provider}`);
      return null;
    }

    return {
      provider: gateway.provider,
      displayName: gateway.displayName,
      isActive: gateway.isActive,
      isSandbox: gateway.isSandbox,
      currency: gateway.currency,
      hasCredentials: checkCredentials(gateway.provider),
      config: gateway.config as Record<string, unknown> | null,
    };
  } catch (error) {
    logger.error(`Error getting gateway config for ${provider}`, error);
    return null;
  }
}

/**
 * Obtiene la configuración de todos los gateways activos
 */
export async function getActiveGateways(): Promise<GatewayConfig[]> {
  try {
    const gateways = await prisma.paymentGateway.findMany({
      where: { isActive: true },
    });

    return gateways
      // Validar provider antes de procesar (fail-closed)
      .filter((gateway) => {
        if (!isValidProvider(gateway.provider)) {
          logger.error(`Invalid provider value in database: ${gateway.provider}`);
          return false;
        }
        return checkCredentials(gateway.provider);
      })
      .map((gateway) => ({
        // Safe cast - ya validamos con isValidProvider
        provider: gateway.provider as PaymentProvider,
        displayName: gateway.displayName,
        isActive: gateway.isActive,
        isSandbox: gateway.isSandbox,
        currency: gateway.currency,
        hasCredentials: true,
        config: gateway.config as Record<string, unknown> | null,
      }));
  } catch (error) {
    logger.error("Error getting active gateways", error);
    return [];
  }
}

/**
 * Obtiene las credenciales de PayPal combinando BD y .env
 */
export async function getPayPalCredentials(): Promise<PayPalCredentials | null> {
  const config = await getGatewayConfig("PAYPAL");

  if (!config || !config.isActive || !config.hasCredentials) {
    return null;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    mode: config.isSandbox ? "sandbox" : "live",
  };
}

/**
 * Obtiene las credenciales de Payway combinando BD y .env
 */
export async function getPaywayCredentials(): Promise<PaywayCredentials | null> {
  const config = await getGatewayConfig("PAYWAY");

  if (!config || !config.isActive || !config.hasCredentials) {
    return null;
  }

  const apiKey = process.env.PAYWAY_API_KEY;
  const merchantId = process.env.PAYWAY_MERCHANT_ID;

  if (!apiKey || !merchantId) {
    return null;
  }

  return {
    apiKey,
    merchantId,
    environment: config.isSandbox ? "sandbox" : "production",
  };
}

/**
 * Verifica si un gateway está disponible para procesar pagos
 */
export async function isGatewayAvailable(provider: PaymentProvider): Promise<boolean> {
  const config = await getGatewayConfig(provider);
  return config !== null && config.isActive && config.hasCredentials;
}

/**
 * Obtiene el gateway apropiado según la moneda
 */
export async function getGatewayForCurrency(currency: string): Promise<GatewayConfig | null> {
  const activeGateways = await getActiveGateways();
  return activeGateways.find((g) => g.currency === currency) || null;
}

/**
 * Obtiene todos los gateways disponibles para mostrar en checkout
 */
export async function getAvailableGatewaysForCheckout(): Promise<GatewayConfig[]> {
  return getActiveGateways();
}

