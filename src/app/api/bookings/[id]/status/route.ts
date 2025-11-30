/**
 * @swagger
 * /api/bookings/{id}/status:
 *   put:
 *     summary: Actualizar estado de booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, CANCELLED]
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { BookingsController } from "@/modules/booking/api/controllers/bookingsController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";

const controller = new BookingsController();

export const PUT = withRateLimitHandler("write", withControllerErrorHandler(async (request, context) => {
  const { id } = await context.params;
  const body = await request.json();
  const booking = await controller.updateStatus(id, body);
  return successResponse(booking);
}));

