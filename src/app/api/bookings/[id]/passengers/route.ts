/**
 * @swagger
 * /api/bookings/{id}/passengers:
 *   get:
 *     summary: Obtener pasajeros de un booking
 *     tags: [Passengers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del booking
 *     responses:
 *       200:
 *         description: Lista de pasajeros del booking
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
 *                     properties:
 *                       id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [ADULT, CHILD, INFANT]
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { PassengersController } from "@/modules/passengers/api/controllers/passengersController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";

const controller = new PassengersController();

export const GET = withRateLimitHandler("public", withControllerErrorHandler(async (request, context) => {
  const { id } = await context.params;
  const passengers = await controller.getByBookingId(id);
  return successResponse(passengers);
}));

