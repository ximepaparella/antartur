/**
 * @swagger
 * /api/availability/{id}:
 *   get:
 *     summary: Obtener disponibilidad por ID
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la disponibilidad
 *     responses:
 *       200:
 *         description: Disponibilidad encontrada
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
 *   put:
 *     summary: Actualizar disponibilidad
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la disponibilidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               available:
 *                 type: number
 *               seatsTotal:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Disponibilidad actualizada exitosamente
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
 *   delete:
 *     summary: Eliminar disponibilidad
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la disponibilidad
 *     responses:
 *       204:
 *         description: Disponibilidad eliminada exitosamente
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { AvailabilityController } from "@/modules/departures/api/controllers/availabilityController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse, noContentResponse } from "@/lib/api/response";

const controller = new AvailabilityController();

export const GET = withRateLimitHandler("public", withControllerErrorHandler(async (request, context) => {
  const { id } = await context!.params!;
  const availability = await controller.getById(id);
  return successResponse(availability);
}));

export const PUT = withRateLimitHandler("write", withControllerErrorHandler(async (request, context) => {
  const { id } = await context!.params!;
  const body = await request.json();
  const availability = await controller.update(id, body);
  return successResponse(availability);
}));

export const DELETE = withRateLimitHandler("write", withControllerErrorHandler(async (request, context) => {
  const { id } = await context!.params!;
  await controller.delete(id);
  return noContentResponse();
}));

