/**
 * @swagger
 * /api/bookings/order/{orderId}:
 *   get:
 *     summary: Obtener bookings de una orden
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *       - in: query
 *         name: includePassengers
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir información de pasajeros
 *     responses:
 *       200:
 *         description: Lista de bookings de la orden
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

import { BookingsController } from "@/modules/booking/api/controllers/bookingsController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";
import { validateQuery } from "@/lib/validation/schemas";
import { orderBookingsQuerySchema } from "@/modules/booking/api/validators/bookingsValidators";

const controller = new BookingsController();

export const GET = withRateLimitHandler("public", withControllerErrorHandler(async (request, context) => {
  const { orderId } = await context.params;
  const { searchParams } = new URL(request.url);
  const query = validateQuery(orderBookingsQuerySchema, Object.fromEntries(searchParams));

  const bookings = await controller.getByOrderId(orderId, query.includePassengers);
  return successResponse(bookings);
}));

