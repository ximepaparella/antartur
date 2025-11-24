/**
 * @swagger
 * /api/payments/order/{orderId}:
 *   get:
 *     summary: Obtener pagos de una orden
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Lista de pagos de la orden
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

import { PaymentsController } from "@/modules/payments/api/controllers/paymentsController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";

const controller = new PaymentsController();

export const GET = withRateLimitHandler("public", withControllerErrorHandler(async (request, context) => {
  const { orderId } = await context!.params!;
  const payments = await controller.getByOrderId(orderId);
  return successResponse(payments);
}));

