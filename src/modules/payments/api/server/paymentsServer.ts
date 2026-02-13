/**
 * Funciones server-side para obtener métodos de pago
 * Optimizado para Server Components de Next.js
 */

import { getActiveGateways } from "@/modules/payments/domain/gatewayConfigService";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/services/logger";
import type { AvailablePaymentMethod } from "@/modules/payments/domain/types";

export interface AllPaymentMethods {
  ARS: AvailablePaymentMethod[];
  USD: AvailablePaymentMethod[];
  hasOnlinePayment: {
    ARS: boolean;
    USD: boolean;
  };
}

/**
 * Obtiene todos los métodos de pago disponibles para ambas monedas
 * Optimizado para cargar una sola vez al inicio de la página
 * 
 * @returns Métodos de pago agrupados por moneda
 */
export async function getAllPaymentMethods(): Promise<AllPaymentMethods> {
  try {
    // Obtener todos los gateways activos (sin filtrar por moneda)
    const activeGateways = await getActiveGateways();

    // Agrupar por moneda
    const methodsByCurrency: AllPaymentMethods = {
      ARS: [],
      USD: [],
      hasOnlinePayment: {
        ARS: false,
        USD: false,
      },
    };

    // Mapear gateways a métodos de pago
    for (const gateway of activeGateways) {
      const method: AvailablePaymentMethod = {
        provider: gateway.provider.toLowerCase(), // "paypal", "payway"
        displayName: gateway.displayName,
        currency: gateway.currency,
      };

      if (gateway.currency === "ARS") {
        methodsByCurrency.ARS.push(method);
        methodsByCurrency.hasOnlinePayment.ARS = true;
      } else if (gateway.currency === "USD") {
        methodsByCurrency.USD.push(method);
        methodsByCurrency.hasOnlinePayment.USD = true;
      }
    }

    // Agregar transferencia bancaria para ARS si está activa
    try {
      const bankTransfer = await prisma.bankTransfer.findFirst({
        where: { isActive: true },
      });

      if (bankTransfer) {
        methodsByCurrency.ARS.push({
          provider: "transferencia",
          displayName: "Transferencia Bancaria",
          currency: "ARS",
        });
      }
    } catch (dbError) {
      logger.warn("Error checking bank transfer availability", {
        error: dbError instanceof Error ? dbError.message : String(dbError),
      });
    }

    return methodsByCurrency;
  } catch (error) {
    logger.error("Error getting all payment methods", error);
    
    // Retornar estructura vacía en caso de error
    return {
      ARS: [],
      USD: [],
      hasOnlinePayment: {
        ARS: false,
        USD: false,
      },
    };
  }
}

/**
 * Obtiene métodos de pago para una moneda específica
 * Versión optimizada que usa el resultado de getAllPaymentMethods
 * 
 * @param currency - Código de moneda (ARS, USD)
 * @param allMethods - Resultado de getAllPaymentMethods (opcional, si no se proporciona se obtiene)
 * @returns Métodos de pago para la moneda especificada
 */
export async function getPaymentMethodsForCurrency(
  currency: string,
  allMethods?: AllPaymentMethods
): Promise<{
  methods: AvailablePaymentMethod[];
  hasOnlinePayment: boolean;
}> {
  const methods = allMethods || (await getAllPaymentMethods());
  
  const currencyUpper = currency.toUpperCase() as "ARS" | "USD";
  const currencyMethods = methods[currencyUpper] || [];

  return {
    methods: currencyMethods,
    hasOnlinePayment: methods.hasOnlinePayment[currencyUpper] || false,
  };
}
