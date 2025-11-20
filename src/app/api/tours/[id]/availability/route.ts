/**
 * API Route: Availability por Tour
 * GET /api/tours/:id/availability - Obtener disponibilidad de un tour
 * POST /api/tours/:id/availability - Crear availability para un tour
 */

import { availabilityHandler } from "@/modules/departures/api/handlers/availabilityHandler";

export const GET = availabilityHandler.getByTourId;
export const POST = availabilityHandler.create;

