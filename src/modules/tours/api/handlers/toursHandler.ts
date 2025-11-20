/**
 * HTTP Handlers para Tours
 * Maneja requests HTTP y delega a controllers
 */

import { NextRequest } from "next/server";
import { ToursController } from "../controllers/toursController";
import { successResponse, createdResponse, noContentResponse, paginatedResponse } from "@/lib/api/response";
import { withErrorHandler } from "@/lib/api/errorHandler";
import { tourIdParamsSchema, tourSlugParamsSchema } from "../validators/toursValidators";
import { validateQuery } from "@/lib/validation/schemas";

const controller = new ToursController();

export const toursHandler = {
  /**
   * GET /api/tours - Listar tours
   */
  list: withErrorHandler(async (request: NextRequest) => {
    const result = await controller.list(request);
    return paginatedResponse(result.data, result.meta);
  }),

  /**
   * GET /api/tours/:id - Obtener tour por ID
   */
  getById: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeAvailability = searchParams.get("includeAvailability") === "true";

    const tour = await controller.getById(id, includeAvailability);
    return successResponse(tour);
  }),

  /**
   * GET /api/tours/slug/:slug - Obtener tour por slug
   */
  getBySlug: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const includeAvailability = searchParams.get("includeAvailability") === "true";

    const tour = await controller.getBySlug(slug, includeAvailability);
    return successResponse(tour);
  }),

  /**
   * POST /api/tours - Crear tour
   */
  create: withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const tour = await controller.create(body);
    return createdResponse(tour);
  }),

  /**
   * PUT /api/tours/:id - Actualizar tour
   */
  update: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await request.json();
    const tour = await controller.update(id, body);
    return successResponse(tour);
  }),

  /**
   * DELETE /api/tours/:id - Eliminar tour
   */
  delete: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await controller.delete(id);
    return noContentResponse();
  }),
};

