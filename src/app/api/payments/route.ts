/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Crear registro de pago (admin)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, amount, currency, method]
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [ARS, USD]
 *               method:
 *                 type: string
 *                 enum: [PAYPAL, PAYWAY]
 *               transactionId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *     responses:
 *       201:
 *         description: Pago creado exitosamente
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

import { PaymentsController } from "@/modules/payments/api/controllers/paymentsController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { createdResponse } from "@/lib/api/response";

const controller = new PaymentsController();

export const POST = withRateLimitHandler("write", withControllerErrorHandler(async (request, context) => {
  const body = await request.json();
  const payment = await controller.create(body);
  return createdResponse(payment);
}));

