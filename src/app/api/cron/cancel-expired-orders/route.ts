/**
 * @swagger
 * /api/cron/cancel-expired-orders:
 *   get:
 *     summary: Cancelar órdenes expiradas (Cron Job)
 *     tags: [Cron Jobs]
 *     description: Cancela automáticamente las órdenes que han expirado. Ejecutar cada hora. Requiere autenticación con CRON_SECRET.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: secret
 *         schema:
 *           type: string
 *         description: CRON_SECRET como query parameter (alternativa al header Authorization)
 *     responses:
 *       200:
 *         description: Órdenes canceladas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Procesadas 5 órdenes"
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: No autorizado (CRON_SECRET inválido)
 *   post:
 *     summary: Cancelar órdenes expiradas (método POST alternativo)
 *     tags: [Cron Jobs]
 *     description: Versión POST del endpoint para compatibilidad con algunos sistemas de cron
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: secret
 *         schema:
 *           type: string
 *         description: CRON_SECRET como query parameter
 *     responses:
 *       200:
 *         description: Órdenes canceladas exitosamente
 *       401:
 *         description: No autorizado
 */

import { NextRequest, NextResponse } from "next/server";
import { cancelExpiredOrders } from "@/modules/orders/domain/orderService";

export const dynamic = "force-dynamic";
function isAuthorized(request: NextRequest): boolean {
  // Vercel Cron envía un header Authorization con el secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // También permitir si viene de Vercel Cron (tiene header específico)
  const vercelCron = request.headers.get("x-vercel-cron");
  if (vercelCron === "1") {
    return true;
  }

  // En desarrollo, permitir sin autenticación
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  // Verificar autorización
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const results = await cancelExpiredOrders();

    return NextResponse.json({
      success: true,
      message: `Procesadas ${results.length} órdenes`,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error al cancelar órdenes expiradas:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// También permitir POST para compatibilidad con algunos sistemas de cron
export const POST = GET;

