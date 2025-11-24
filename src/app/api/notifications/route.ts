/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Crear notificación
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, type, message]
 *             properties:
 *               orderId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [EMAIL, SMS, PUSH]
 *               message:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, SENT, FAILED]
 *     responses:
 *       201:
 *         description: Notificación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */

import { NotificationsController } from "@/modules/notifications/api/controllers/notificationsController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { createdResponse } from "@/lib/api/response";

const controller = new NotificationsController();

export const POST = withRateLimitHandler("notifications", withControllerErrorHandler(async (request) => {
  const body = await request.json();
  const notification = await controller.create(body);
  return createdResponse(notification);
}));

