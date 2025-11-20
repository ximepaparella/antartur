/**
 * API Route: Booking por ID
 * GET /api/bookings/:id - Obtener booking por ID
 */

import { bookingsHandler } from "@/modules/booking/api/handlers/bookingsHandler";

export const GET = bookingsHandler.getById;

