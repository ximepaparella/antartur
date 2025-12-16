/**
 * @swagger
 * /api/tours/{id}/prices:
 *   get:
 *     summary: Listar precios de un tour
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           enum: [ARS, USD]
 *         description: Filtrar por moneda específica (opcional)
 *     responses:
 *       200:
 *         description: Lista de precios del tour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   oneOf:
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/TourPrice'
 *                     - $ref: '#/components/schemas/TourPrice'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   post:
 *     summary: Crear precio para un tour
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
 *             $ref: '#/components/schemas/CreateTourPriceInput'
 *     responses:
 *       201:
 *         description: Precio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TourPrice'
 */

import { TourPricesController } from "@/modules/tours/api/controllers/tourPricesController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse, createdResponse } from "@/lib/api/response";
import { validateQuery } from "@/lib/validation/schemas";
import { idSchema, currencyCodeSchema } from "@/lib/validation/schemas";
import { withAuth } from "@/lib/auth";

const controller = new TourPricesController();

// GET es público - permite consultar precios sin autenticación
export const GET = withRateLimitHandler("public", withControllerErrorHandler(async (request, context) => {
  const { id: tourId } = await context.params;
  idSchema.parse(tourId);
  
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get("currency");
  
  if (currency) {
    currencyCodeSchema.parse(currency);
    const price = await controller.getByTourIdAndCurrency(tourId, currency);
    return successResponse(price);
  }
  
  const prices = await controller.listByTourId(tourId);
  return successResponse(prices);
}));

// POST requiere autenticación de admin
export const POST = withAuth(
  withRateLimitHandler("write", withControllerErrorHandler(async (request, context) => {
    const { id: tourId } = await context.params;
    idSchema.parse(tourId);
    const body = await request.json();
    const { validateBody } = await import("@/lib/validation/schemas");
    const { createTourPriceSchema } = await import("@/modules/tours/api/validators/tourPricesValidators");
    const data = validateBody(createTourPriceSchema, { ...body, tourId });
    const newPrice = await controller.create(data);
    return createdResponse(newPrice);
  })),
  { roles: ["ADMIN"] }
);

