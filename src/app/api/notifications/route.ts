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
 *             required: [type, recipient, templateKey]
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID de la orden asociada (opcional)
 *               type:
 *                 type: string
 *                 enum: [EMAIL, WHATSAPP]
 *                 description: Tipo de notificación
 *               recipient:
 *                 type: string
 *                 description: Email o número de teléfono del destinatario
 *                 example: "cliente@example.com"
 *               templateKey:
 *                 type: string
 *                 description: Clave del template de notificación
 *                 enum: [reservation-confirmation, reservation-notification, enquiry-confirmation, enquiry-notification, payment-confirmation]
 *                 example: "reservation-confirmation"
 *               subject:
 *                 type: string
 *                 description: Asunto del email (opcional)
 *               body:
 *                 type: string
 *                 description: Cuerpo del mensaje (opcional)
 *               status:
 *                 type: string
 *                 enum: [PENDING, SENT, ERROR]
 *                 default: PENDING
 *                 description: Estado inicial de la notificación
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

export const POST = withRateLimitHandler("notifications", withControllerErrorHandler(async (request, context) => {
  const body = await request.json();
  const notification = await controller.create(body);
  return createdResponse(notification);
}));

