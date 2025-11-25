/**
 * @swagger
 * /api/tours/{id}/prices/{priceId}:
 *   put:
 *     summary: Actualizar precio de un tour
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *       - in: path
 *         name: priceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del precio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priceAdult:
 *                 type: number
 *               priceChild:
 *                 type: number
 *     responses:
 *       200:
 *         description: Precio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TourPrice'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Eliminar precio de un tour
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *       - in: path
 *         name: priceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del precio
 *     responses:
 *       204:
 *         description: Precio eliminado exitosamente
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { TourPricesController } from "@/modules/tours/api/controllers/tourPricesController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse, noContentResponse } from "@/lib/api/response";
import { idSchema } from "@/lib/validation/schemas";

const controller = new TourPricesController();

export const PUT = withRateLimitHandler("write", withControllerErrorHandler(async (request, context) => {
  const { priceId } = await context.params;
  idSchema.parse(priceId);
  const body = await request.json();
  const { validateBody } = await import("@/lib/validation/schemas");
  const { updateTourPriceSchema } = await import("@/modules/tours/api/validators/tourPricesValidators");
  const data = validateBody(updateTourPriceSchema, body);
  const updatedPrice = await controller.update(priceId, data);
  return successResponse(updatedPrice);
}));

export const DELETE = withRateLimitHandler("write", withControllerErrorHandler(async (request, context) => {
  const { priceId } = await context.params;
  idSchema.parse(priceId);
  await controller.delete(priceId);
  return noContentResponse();
}));

