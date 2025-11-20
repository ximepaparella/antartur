/**
 * HTTP Handlers para TourPrices
 * Maneja requests HTTP y delega a controllers
 */

import { NextRequest } from "next/server";
import { TourPricesController } from "../controllers/tourPricesController";
import { successResponse, createdResponse, noContentResponse } from "@/lib/api/response";
import { withErrorHandler } from "@/lib/api/errorHandler";
import { validateBody, idSchema, currencyCodeSchema } from "@/lib/validation/schemas";
import {
  createTourPriceSchema,
  updateTourPriceSchema,
} from "../validators/tourPricesValidators";

const controller = new TourPricesController();

export const tourPricesHandler = {
  /**
   * GET /api/tours/:id/prices - Listar precios de un tour
   * GET /api/tours/:id/prices?currency=ARS - Obtener precio específico por moneda
   */
  list: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: tourId } = await params;
    idSchema.parse(tourId);
    
    // Si hay query param currency, retornar solo ese precio
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency");
    
    if (currency) {
      currencyCodeSchema.parse(currency);
      const price = await controller.getByTourIdAndCurrency(tourId, currency);
      return successResponse(price);
    }
    
    // Si no hay currency, listar todos los precios
    const prices = await controller.listByTourId(tourId);
    return successResponse(prices);
  }),

  /**
   * POST /api/tours/:id/prices - Crear precio para un tour
   */
  create: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: tourId } = await params;
    idSchema.parse(tourId);
    const body = await request.json();
    const data = validateBody(createTourPriceSchema, { ...body, tourId });
    const newPrice = await controller.create(data);
    return createdResponse(newPrice);
  }),

  /**
   * PUT /api/tours/:id/prices/:priceId - Actualizar precio
   */
  update: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string; priceId: string }> }) => {
    const { priceId } = await params;
    idSchema.parse(priceId);
    const body = await request.json();
    const data = validateBody(updateTourPriceSchema, body);
    const updatedPrice = await controller.update(priceId, data);
    return successResponse(updatedPrice);
  }),

  /**
   * DELETE /api/tours/:id/prices/:priceId - Eliminar precio
   */
  remove: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string; priceId: string }> }) => {
    const { priceId } = await params;
    idSchema.parse(priceId);
    await controller.delete(priceId);
    return noContentResponse();
  }),
};

