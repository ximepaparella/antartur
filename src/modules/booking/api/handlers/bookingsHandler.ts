/**
 * HTTP Handlers para Bookings
 * Maneja requests HTTP y delega a controllers
 */

import { NextRequest } from "next/server";
import { BookingsController } from "../controllers/bookingsController";
import { successResponse } from "@/lib/api/response";
import { withErrorHandler } from "@/lib/api/errorHandler";
import { validateQuery } from "@/lib/validation/schemas";
import { orderBookingsQuerySchema } from "../validators/bookingsValidators";

const controller = new BookingsController();

export const bookingsHandler = {
  /**
   * GET /api/bookings/:id - Obtener booking por ID
   */
  getById: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const booking = await controller.getById(id);
    return successResponse(booking);
  }),

  /**
   * GET /api/bookings/order/:orderId - Obtener bookings de una orden
   */
  getByOrderId: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) => {
    const { orderId } = await params;
    const { searchParams } = new URL(request.url);
    const query = validateQuery(orderBookingsQuerySchema, Object.fromEntries(searchParams));

    const bookings = await controller.getByOrderId(orderId, query.includePassengers);
    return successResponse(bookings);
  }),

  /**
   * PUT /api/bookings/:id/status - Actualizar estado de booking
   */
  updateStatus: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await request.json();

    const booking = await controller.updateStatus(id, body);
    return successResponse(booking);
  }),
};

