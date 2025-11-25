/**
 * Controller para Bookings
 * Solo orquesta: valida entrada, llama servicios, transforma salida
 */

import { BookingService } from "../../domain/bookingService";
import { validateBody } from "@/lib/validation/schemas";
import {
  updateBookingStatusSchema,
  type UpdateBookingStatusInput,
} from "../validators/bookingsValidators";
import { toBookingResponse } from "../dto/bookingsDto";

const bookingService = new BookingService();

export class BookingsController {
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

