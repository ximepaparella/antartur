/**
 * @swagger
 * /api/tours/{id}:
 *   get:
 *     summary: Obtener tour por ID
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *       - in: query
 *         name: includeAvailability
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir disponibilidad del tour
 *     responses:
 *       200:
 *         description: Tour encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tour'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Actualizar tour
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTourInput'
 *     responses:
 *       200:
 *         description: Tour actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tour'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Eliminar tour
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *     responses:
 *       204:
 *         description: Tour eliminado exitosamente
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { ToursController } from "@/modules/tours/api/controllers/toursController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { successResponse, noContentResponse } from "@/lib/api/response";

const controller = new ToursController();

import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";

export const GET = withRateLimitHandler("public", withControllerErrorHandler(async (request, context) => {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const includeAvailability = searchParams.get("includeAvailability") === "true";
  const includeContent = searchParams.get("includeContent") === "true";

  const tour = await controller.getById(id, includeAvailability, includeContent);
  return successResponse(tour);
}));

export const PUT = withRateLimitHandler("write", withControllerErrorHandler(async (request, context) => {
  const { id } = await context.params;
  const body = await request.json();
  const tour = await controller.update(id, body);
  return successResponse(tour);
}));

export const PATCH = PUT; // Alias para PATCH

export const DELETE = withRateLimitHandler("write", withControllerErrorHandler(async (request, context) => {
  const { id } = await context.params;
  await controller.delete(id);
  return noContentResponse();
}));

