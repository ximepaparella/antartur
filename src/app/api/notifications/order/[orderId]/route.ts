/**
 * @swagger
 * /api/notifications/order/{orderId}:
 *   get:
 *     summary: Obtener notificaciones de una orden
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Lista de notificaciones de la orden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { NotificationsController } from "@/modules/notifications/api/controllers/notificationsController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";

const controller = new NotificationsController();

export const GET = withRateLimitHandler("notifications", withControllerErrorHandler(async (request, context) => {
  const { orderId } = await context!.params!;
  const notifications = await controller.getByOrderId(orderId);
  return successResponse(notifications);
}));

