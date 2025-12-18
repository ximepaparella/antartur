/**
 * @swagger
 * /api/payments/available:
 *   get:
 *     summary: Obtener métodos de pago disponibles
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *         description: Filtrar por moneda (USD, ARS)
 *     responses:
 *       200:
 *         description: Lista de métodos de pago disponibles
 */

import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api/response";
import { getActiveGateways } from "@/modules/payments/domain/gatewayConfigService";
import { ALWAYS_AVAILABLE_METHODS } from "@/modules/payments/domain/constants";
import type { AvailablePaymentMethod } from "@/modules/payments/domain/types";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get("currency");

  // Obtener gateways activos (que tienen isActive=true Y credenciales configuradas)
  const activeGateways = await getActiveGateways();

  // Filtrar por moneda si se especifica
  let filteredGateways = activeGateways;
  if (currency) {
    filteredGateways = activeGateways.filter((g) => g.currency === currency);
  }

  // Mapear a formato simple para el frontend
  const availableMethods: AvailablePaymentMethod[] = filteredGateways.map((g) => ({
    provider: g.provider.toLowerCase(), // "paypal", "payway"
    displayName: g.displayName,
    currency: g.currency,
  }));

  // Verificar si transferencia bancaria está activa (solo para ARS)
  if (currency === "ARS" || !currency) {
    const bankTransfer = await prisma.bankTransfer.findFirst({
      where: { isActive: true },
    });

    if (bankTransfer) {
      availableMethods.push({
        provider: "transferencia",
        displayName: "Transferencia Bancaria",
        currency: "ARS",
      });
    }
  } else {
    // Para otras monedas, usar métodos siempre disponibles si existen
    const alwaysAvailable = ALWAYS_AVAILABLE_METHODS[currency] || [];
    for (const method of alwaysAvailable) {
      availableMethods.push({
        provider: method,
        displayName: method === "transferencia" ? "Transferencia Bancaria" : method,
        currency: currency,
      });
    }
  }

  return successResponse({
    methods: availableMethods,
    // Indicar si hay algún método de pago online disponible
    hasOnlinePayment: filteredGateways.length > 0,
  });
}
