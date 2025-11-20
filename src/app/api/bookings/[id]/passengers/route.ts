/**
 * API Route: Passengers por Booking
 * GET /api/bookings/:id/passengers - Obtener pasajeros de un booking
 */

import { passengersHandler } from "@/modules/passengers/api/handlers/passengersHandler";

export const GET = passengersHandler.getByBookingId;

