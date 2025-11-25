/**
 * @swagger
 * /api/payments/webhook/payway:
 *   post:
 *     summary: Webhook de Payway para procesar notificaciones de pago
 *     tags: [Payments]
 *     description: Endpoint para recibir notificaciones de Payway sobre el estado de los pagos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload de notificación de Payway
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 */

import { PaymentsController } from "@/modules/payments/api/controllers/paymentsController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";

const controller = new PaymentsController();

// Webhooks necesitan límite más alto ya que pueden recibir múltiples requests
export const POST = withRateLimitHandler({
  points: 100,
  duration: 3600,
}, withControllerErrorHandler(async (request, context) => {
  const body = await request.json();
  const result = await controller.processPaywayWebhook(body);
  return successResponse(result);
}));

