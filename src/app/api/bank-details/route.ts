/**
 * @swagger
 * /api/bank-details:
 *   get:
 *     summary: Obtener datos bancarios para transferencia
 *     tags: [Payments]
 *     description: Retorna los datos bancarios si la transferencia está activa. Si no está activa, retorna 404.
 *     responses:
 *       200:
 *         description: Datos bancarios obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BankDetailsResponse'
 *       404:
 *         description: Transferencia bancaria no disponible
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
 *                   example: "Bank transfer is not available"
 *                 code:
 *                   type: string
 *                   example: "NOT_AVAILABLE"
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { successResponse, errorResponse } from "@/lib/api/response";

export const dynamic = "force-dynamic";
export const GET = withControllerErrorHandler(async (request: NextRequest) => {
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
});
