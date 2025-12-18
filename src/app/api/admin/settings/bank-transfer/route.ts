/**
 * API Route para gestionar configuración de transferencia bancaria
 * GET: Obtener configuración actual
 * PATCH: Actualizar configuración
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse, errorResponse } from "@/lib/api/response";
import { getBankTransferDefaultConfig } from "@/lib/config/bankTransfer";
import { z } from "zod";

const updateBankTransferSchema = z.object({
  isActive: z.boolean().optional(),
  accountName: z.string().min(1, "Account name is required").max(200).optional(),
  accountNumber: z.string().min(1, "Account number is required").max(50).optional(),
  bank: z.string().min(1, "Bank name is required").max(100).optional(),
  cuit: z.string().min(1, "CUIT is required").max(20).optional(),
  cbu: z.string().min(1, "CBU is required").max(50).optional(),
  alias: z.string().min(1, "Alias is required").max(50).optional(),
});

/**
 * GET /api/admin/settings/bank-transfer
 * Obtiene la configuración actual de transferencia bancaria
 */
export const GET = withAuth(
  withRateLimitHandler(
    "admin",
    withControllerErrorHandler(async (request: NextRequest) => {
      // Verificar que el modelo esté disponible
      if (!prisma.bankTransfer) {
        throw new Error("BankTransfer model not available. Please restart the development server after running 'npx prisma generate'");
      }

      // Buscar o crear configuración por defecto
      let bankTransfer = await prisma.bankTransfer.findFirst();

      // Si no existe, crear una con valores por defecto vacíos
      // El admin debe configurar los valores reales desde el dashboard
      if (!bankTransfer) {
        const defaultConfig = getBankTransferDefaultConfig();
        bankTransfer = await prisma.bankTransfer.create({
          data: {
            id: "default",
            isActive: false,
            accountName: defaultConfig.accountName,
            accountNumber: defaultConfig.accountNumber,
            bank: defaultConfig.bank,
            cuit: defaultConfig.cuit,
            cbu: defaultConfig.cbu,
            alias: defaultConfig.alias,
          },
        });
      }

      return successResponse(bankTransfer);
    })
  ),
  { roles: ["ADMIN"] }
);

/**
 * PATCH /api/admin/settings/bank-transfer
 * Actualiza la configuración de transferencia bancaria
 */
export const PATCH = withAuth(
  withRateLimitHandler(
    "admin",
    withControllerErrorHandler(async (request: NextRequest) => {
      // Verificar que el modelo esté disponible
      if (!prisma.bankTransfer) {
        throw new Error("BankTransfer model not available. Please restart the development server after running 'npx prisma generate'");
      }

      const body = await request.json();
      
      // Validar datos
      const validatedData = updateBankTransferSchema.parse(body);

      // Buscar o crear configuración
      let bankTransfer = await prisma.bankTransfer.findFirst();

      if (!bankTransfer) {
        // Crear nueva configuración con valores por defecto vacíos como fallback
        // El admin debe configurar los valores reales desde el dashboard
        const defaultConfig = getBankTransferDefaultConfig();
        bankTransfer = await prisma.bankTransfer.create({
          data: {
            id: "default",
            isActive: validatedData.isActive ?? false,
            accountName: validatedData.accountName ?? defaultConfig.accountName,
            accountNumber: validatedData.accountNumber ?? defaultConfig.accountNumber,
            bank: validatedData.bank ?? defaultConfig.bank,
            cuit: validatedData.cuit ?? defaultConfig.cuit,
            cbu: validatedData.cbu ?? defaultConfig.cbu,
            alias: validatedData.alias ?? defaultConfig.alias,
          },
        });
      } else {
        // Actualizar configuración existente
        bankTransfer = await prisma.bankTransfer.update({
          where: { id: bankTransfer.id },
          data: validatedData,
        });
      }

      return successResponse(bankTransfer);
    })
  ),
  { roles: ["ADMIN"] }
);
