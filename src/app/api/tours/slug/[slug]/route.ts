/**
 * @swagger
 * /api/tours/slug/{slug}:
 *   get:
 *     summary: Obtener tour por slug
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug del tour (URL-friendly identifier)
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
 */

import { ToursController } from "@/modules/tours/api/controllers/toursController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";

const controller = new ToursController();

export const GET = withRateLimitHandler("public", withControllerErrorHandler(async (request, context) => {
  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const includeImages = searchParams.get("includeImages") !== "false";
  const includeDepartures = searchParams.get("includeDepartures") === "true";
  const includePrices = searchParams.get("includePrices") !== "false";
  const includeContent = searchParams.get("includeContent") === "true";

  const tour = await controller.getBySlug(slug, includeImages, includeDepartures, includePrices, includeContent);
  return successResponse(tour);
}));

