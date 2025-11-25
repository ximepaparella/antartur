/**
 * @swagger
 * /api/orders/code/{code}:
 *   get:
 *     summary: Obtener orden por codigo
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Codigo unico de la orden (ej. ORD-2024-001)
 *       - in: query
 *         name: includePayments
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir informacion de pagos
 *     responses:
 *       200:
 *         description: Orden encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { OrdersController } from "@/modules/orders/api/controllers/ordersController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";

const controller = new OrdersController();

export const GET = withRateLimitHandler("public", withControllerErrorHandler(async (request, context) => {
  const { code } = await context.params;
  const { searchParams } = new URL(request.url);
  const includePayments = searchParams.get("includePayments") === "true";

  const order = await controller.getByCode(code, includePayments);
  return successResponse(order);
}));

