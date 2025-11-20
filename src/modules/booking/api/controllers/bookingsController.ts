/**
 * Controller para Bookings
 * Maneja la lógica de validación, transformación y llamadas a servicios
 */

import { BookingRepository } from "../../infra/bookingRepository";
import { OrderRepository } from "../../../orders/infra/orderRepository";
import { validateBody } from "@/lib/validation/schemas";
import {
  updateBookingStatusSchema,
  type UpdateBookingStatusInput,
} from "../validators/bookingsValidators";
import { toBookingResponse } from "../dto/bookingsDto";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { prisma } from "@/lib/db";

const bookingRepository = new BookingRepository();
const orderRepository = new OrderRepository();

export class BookingsController {
  /**
   * Obtener booking por ID
   */
  async getById(id: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError("Booking", id);
    }

    return toBookingResponse(booking);
  }

  /**
   * Obtener bookings de una orden
   */
  async getByOrderId(orderId: string, includePassengers = false) {
    // Verificar que la orden existe
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order", orderId);
    }

    const bookings = await bookingRepository.findAll(orderId);
    return bookings.map(toBookingResponse);
  }

  /**
   * Actualizar estado de booking
   */
  async updateStatus(id: string, body: unknown) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError("Booking", id);
    }

    const data = validateBody(updateBookingStatusSchema, body);

    // Validaciones de transición de estado
    if (booking.status === "CANCELLED") {
      throw new ValidationError("Cannot change status from CANCELLED");
    }

    if (booking.status === "CONFIRMED" && data.status === "HELD") {
      throw new ValidationError("Cannot change status from CONFIRMED to HELD");
    }

    const updated = await bookingRepository.updateStatus(id, data.status);
    return toBookingResponse(updated);
  }
}

