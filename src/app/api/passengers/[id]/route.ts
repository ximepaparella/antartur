/**
 * @swagger
 * /api/passengers/{id}:
 *   get:
 *     summary: Obtener pasajero por ID
 *     tags: [Passengers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pasajero
 *     responses:
 *       200:
 *         description: Pasajero encontrado
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
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [ADULT, CHILD, INFANT]
 *                     birthDate:
 *                       type: string
 *                       format: date
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { PassengersController } from "@/modules/passengers/api/controllers/passengersController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";

const controller = new PassengersController();

export const GET = withRateLimitHandler("public", withControllerErrorHandler(async (request, context) => {
  const { id } = await context!.params!;
  const passenger = await controller.getById(id);
  return successResponse(passenger);
}));

