/**
 * Controller para Bookings
 * Solo orquesta: valida entrada, llama servicios, transforma salida
 */

import { NextRequest } from "next/server";
import { BookingService } from "../../domain/bookingService";
import { validateBody, validateQuery } from "@/lib/validation/schemas";
import {
  updateBookingStatusSchema,
  type UpdateBookingStatusInput,
} from "../validators/bookingsValidators";
import { toBookingResponse } from "../dto/bookingsDto";
import { calculatePaginationMeta } from "@/lib/api/response";
import { z } from "zod";

const bookingService = new BookingService();

const listBookingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.string().optional(),
  orderId: z.string().optional(),
});

export class BookingsController {
  /**
   * Listar bookings con paginación y filtros
   */
  async list(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = validateQuery(listBookingsQuerySchema, Object.fromEntries(searchParams));

    const result = await bookingService.listBookings({
      page: query.page,
      limit: query.limit,
      status: query.status,
      orderId: query.orderId,
    });

    const meta = calculatePaginationMeta(result.page, result.limit, result.total);
    const data = result.data.map(toBookingResponse);

    return { data, meta };
  }

  /**
   * Obtener booking por ID
   */
  async getById(id: string) {
    const booking = await bookingService.getBookingById(id);
    return toBookingResponse(booking);
  }

  /**
   * Obtener bookings de una orden
   */
  async getByOrderId(orderId: string, includePassengers = false) {
    const bookings = await bookingService.getBookingsByOrderId(orderId, includePassengers);
    return bookings.map(toBookingResponse);
  }

  /**
   * Actualizar estado de booking
   */
  async updateStatus(id: string, body: unknown) {
    const data = validateBody(updateBookingStatusSchema, body);
    const updated = await bookingService.updateBookingStatus(id, data.status);
    return toBookingResponse(updated);
  }
}

