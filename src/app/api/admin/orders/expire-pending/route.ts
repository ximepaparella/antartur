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

import { AdminController } from "@/modules/orders/api/controllers/adminController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";

const controller = new AdminController();

export const POST = withRateLimitHandler("admin", withControllerErrorHandler(async (request, context) => {
  const result = await controller.expirePendingOrders();
  return successResponse(result);
}));

