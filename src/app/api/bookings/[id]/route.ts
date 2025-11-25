/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Obtener booking por ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del booking
 *     responses:
 *       200:
 *         description: Booking encontrado
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
 *                     departureId:
 *                       type: string
 *                     numAdults:
 *                       type: number
 *                     numChildren:
 *                       type: number
 *                     status:
 *                       type: string
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { BookingsController } from "@/modules/booking/api/controllers/bookingsController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";

const controller = new BookingsController();

export const GET = withRateLimitHandler("public", withControllerErrorHandler(async (request, context) => {
  const { id } = await context.params;
  const booking = await controller.getById(id);
  return successResponse(booking);
}));

