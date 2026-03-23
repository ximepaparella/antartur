/**
 * @swagger
 * /api/tours/{id}/availability/{date}:
 *   get:
 *     summary: Obtener disponibilidad para fecha específica
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha en formato YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Disponibilidad para la fecha especificada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Availability'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { AvailabilityController } from "@/modules/departures/api/controllers/availabilityController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth";

const controller = new AvailabilityController();

export const GET = withRateLimitHandler("public", withControllerErrorHandler(async (request, context) => {
  const { id, date } = await context.params;
  const authUser = await getAuthUser(request);
  const includeUnbookable = authUser?.role === "ADMIN";
  const availability = await controller.getByTourIdAndDate(id, date, { includeUnbookable });
  return successResponse(availability);
}));

