/**
 * HTTP Handlers para Availability
 * Maneja requests HTTP y delega a controllers
 */

import { NextRequest } from "next/server";
import { AvailabilityController } from "../controllers/availabilityController";
import { successResponse, createdResponse, noContentResponse } from "@/lib/api/response";
import { withErrorHandler } from "@/lib/api/errorHandler";
import { validateQuery } from "@/lib/validation/schemas";
import { tourAvailabilityQuerySchema } from "../validators/availabilityValidators";

const controller = new AvailabilityController();

export const availabilityHandler = {
  /**
   * GET /api/tours/:id/availability - Obtener disponibilidad de un tour
   */
  getByTourId: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const query = validateQuery(tourAvailabilityQuerySchema, Object.fromEntries(searchParams));

    const availability = await controller.getByTourId(id, query);
    return successResponse(availability);
  }),

  /**
   * GET /api/tours/:id/availability/:date - Obtener disponibilidad para fecha específica
   */
  getByTourIdAndDate: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string; date: string }> }) => {
    const { id, date } = await params;

    const availability = await controller.getByTourIdAndDate(id, date);
    return successResponse(availability);
  }),

  /**
   * GET /api/availability/:id - Obtener availability por ID
   */
  getById: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const availability = await controller.getById(id);
    return successResponse(availability);
  }),

  /**
   * POST /api/tours/:id/availability - Crear availability
   */
  create: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await request.json();
    const data = { ...body, tourId: id };

    const availability = await controller.create(data);
    return createdResponse(availability);
  }),

  /**
   * PUT /api/availability/:id - Actualizar availability
   */
  update: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await request.json();

    const availability = await controller.update(id, body);
    return successResponse(availability);
  }),

  /**
   * DELETE /api/availability/:id - Eliminar availability
   */
  delete: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    await controller.delete(id);
    return noContentResponse();
  }),
};

