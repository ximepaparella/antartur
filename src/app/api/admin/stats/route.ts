/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Obtener estadísticas generales
 *     tags: [Admin]
 *     description: Endpoint para obtener estadísticas administrativas del sistema
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                     totalOrders:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 *                     pendingOrders:
 *                       type: number
 *                     completedOrders:
 *                       type: number
 */

import { AdminController } from "@/modules/orders/api/controllers/adminController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";

const controller = new AdminController();

export const GET = withRateLimitHandler("admin", withControllerErrorHandler(async () => {
  const stats = await controller.getStats();
  return successResponse(stats);
}));

