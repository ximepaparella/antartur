/**
 * API Route: Bookings por Order
 * GET /api/bookings/order/:orderId - Obtener bookings de una orden
 */

import { bookingsHandler } from "@/modules/booking/api/handlers/bookingsHandler";

export const GET = bookingsHandler.getByOrderId;

