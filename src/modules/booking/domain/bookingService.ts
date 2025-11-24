/**
 * Servicio de dominio para Bookings
 * Contiene la lógica de negocio para bookings
 */

import { BookingRepository } from "../infra/bookingRepository";
import { OrderRepository } from "../../orders/infra/orderRepository";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import type { BookingStatus } from "@prisma/client";

const bookingRepository = new BookingRepository();
const orderRepository = new OrderRepository();

export class BookingService {
  /**
   * Obtener booking por ID
   */
  async getBookingById(id: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError("Booking", id);
    }
    return booking;
  }

  /**
   * Obtener bookings de una orden
   */
  async getBookingsByOrderId(orderId: string, includePassengers = false) {
    // Validación de negocio: verificar que la orden existe
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order", orderId);
    }

    const bookings = await bookingRepository.findAll(orderId);
    return bookings;
  }

  /**
   * Actualizar estado de booking
   * Contiene validaciones de transición de estado
   */
  async updateBookingStatus(id: string, newStatus: BookingStatus) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError("Booking", id);
    }

    // Validaciones de negocio: transiciones de estado permitidas
    if (booking.status === "CANCELLED") {
      throw new ValidationError("Cannot change status from CANCELLED");
    }

    if (booking.status === "CONFIRMED" && newStatus === "HELD") {
      throw new ValidationError("Cannot change status from CONFIRMED to HELD");
    }

    const updated = await bookingRepository.updateStatus(id, newStatus);
    return updated;
  }
}

