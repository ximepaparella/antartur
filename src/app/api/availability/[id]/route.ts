/**
 * API Route: Availability por ID
 * GET /api/availability/:id - Obtener availability por ID
 * PUT /api/availability/:id - Actualizar availability
 * DELETE /api/availability/:id - Eliminar availability
 */

import { availabilityHandler } from "@/modules/departures/api/handlers/availabilityHandler";

export const GET = availabilityHandler.getById;
export const PUT = availabilityHandler.update;
export const DELETE = availabilityHandler.delete;

