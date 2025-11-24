/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Obtener notificación por ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación encontrada
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
 *                     id:
 *                       type: string
 *                     orderId:
 *                       type: string
 *                     type:
 *                       type: string
 *                     message:
 *                       type: string
 *                     status:
 *                       type: string
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { NotificationsController } from "@/modules/notifications/api/controllers/notificationsController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";

const controller = new NotificationsController();

export const GET = withRateLimitHandler("notifications", withControllerErrorHandler(async (request, context) => {
  const { id } = await context!.params!;
  const notification = await controller.getById(id);
  return successResponse(notification);
}));

