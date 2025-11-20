/**
 * API Route: Tour por ID
 * GET /api/tours/:id - Obtener tour por ID
 * PUT /api/tours/:id - Actualizar tour
 * DELETE /api/tours/:id - Eliminar tour
 */

import { toursHandler } from "@/modules/tours/api/handlers/toursHandler";

export const GET = toursHandler.getById;
export const PUT = toursHandler.update;
export const DELETE = toursHandler.delete;

