/**
 * @swagger
 * /api/admin/orders/expire-pending:
 *   post:
 *     summary: Expirar órdenes pendientes (cron job)
 *     tags: [Admin]
 *     description: Endpoint para expirar automáticamente órdenes pendientes que han excedido su tiempo de expiración. Debe ser llamado por un cron job.
 *     responses:
 *       200:
 *         description: Proceso completado exitosamente
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
 *                     expiredCount:
 *                       type: number
 *                     message:
 *                       type: string
 */

import { NextRequest, NextResponse } from "next/server";
import { AdminController } from "@/modules/orders/api/controllers/adminController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";

const controller = new AdminController();

/**
 * Verifica el secret de cron job
 * Este endpoint está protegido por CRON_SECRET, no por JWT,
 * ya que está diseñado para ser llamado por un cron job automatizado.
 */
function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET not configured");
    return false;
  }
  
  const authHeader = request.headers.get("Authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export const POST = withRateLimitHandler("admin", withControllerErrorHandler(async (request: NextRequest, context) => {
  // Verificar autorización con CRON_SECRET
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  const result = await controller.expirePendingOrders();
  return successResponse(result);
}));

