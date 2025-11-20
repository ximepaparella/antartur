/**
 * API Route: Availability por Tour y Fecha
 * GET /api/tours/:id/availability/:date - Obtener disponibilidad para fecha específica
 */

import { availabilityHandler } from "@/modules/departures/api/handlers/availabilityHandler";

export const GET = availabilityHandler.getByTourIdAndDate;

