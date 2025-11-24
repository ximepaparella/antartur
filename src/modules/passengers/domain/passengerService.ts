/**
 * Servicio de dominio para Passengers
 * Contiene la lógica de negocio para pasajeros
 */

import { PassengerRepository } from "../infra/passengerRepository";
import { BookingRepository } from "../../booking/infra/bookingRepository";
import { NotFoundError } from "@/lib/api/errorHandler";

const passengerRepository = new PassengerRepository();
const bookingRepository = new BookingRepository();

export class PassengerService {
  /**
   * Obtener pasajero por ID
   */
  async getPassengerById(id: string) {
    const passenger = await passengerRepository.findById(id);
    if (!passenger) {
      throw new NotFoundError("Passenger", id);
    }
    return passenger;
  }

  /**
   * Obtener pasajeros de un booking
   */
  async getPassengersByBookingId(bookingId: string) {
    // Validación de negocio: verificar que el booking existe
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking", bookingId);
    }

    const passengers = await passengerRepository.findAll(bookingId);
    return passengers;
  }
}

