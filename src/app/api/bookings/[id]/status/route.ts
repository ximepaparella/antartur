/**
 * API Route: Actualizar estado de Booking
 * PUT /api/bookings/:id/status - Actualizar estado de booking
 */

import { bookingsHandler } from "@/modules/booking/api/handlers/bookingsHandler";

export const PUT = bookingsHandler.updateStatus;

