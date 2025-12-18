/**
 * API Route pública para obtener datos bancarios
 * GET: Obtiene los datos bancarios si la transferencia está activa
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { successResponse, errorResponse } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/**
 * GET /api/bank-details
 * Obtiene los datos bancarios si la transferencia está activa
 */
export async function GET(request: NextRequest) {
  return withControllerErrorHandler(async () => {
    const bankTransfer = await prisma.bankTransfer.findFirst({
      where: { isActive: true },
    });

    if (!bankTransfer) {
      return errorResponse("Bank transfer is not available", "NOT_AVAILABLE", 404);
    }

    // Retornar solo los datos necesarios (sin id, timestamps, etc.)
    return successResponse({
      accountName: bankTransfer.accountName,
      accountNumber: bankTransfer.accountNumber,
      bank: bankTransfer.bank,
      cuit: bankTransfer.cuit,
      cbu: bankTransfer.cbu,
      alias: bankTransfer.alias,
    });
  })(request);
}
