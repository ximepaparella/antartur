/**
 * Controller para Passengers
 * Maneja la lógica de validación, transformación y llamadas a servicios
 */

import { PassengerRepository } from "../../infra/passengerRepository";
import { BookingRepository } from "../../../booking/infra/bookingRepository";
import { toPassengerResponse } from "../dto/passengersDto";
import { NotFoundError } from "@/lib/api/errorHandler";

const passengerRepository = new PassengerRepository();
const bookingRepository = new BookingRepository();

export class PassengersController {
  /**
   * Obtener pasajero por ID
   */
  async getById(id: string) {
    const passenger = await passengerRepository.findById(id);
    if (!passenger) {
      throw new NotFoundError("Passenger", id);
    }

    return toPassengerResponse(passenger);
  }

  /**
   * Obtener pasajeros de un booking
   */
  async getByBookingId(bookingId: string) {
    // Verificar que el booking existe
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking", bookingId);
    }

    const passengers = await passengerRepository.findAll(bookingId);
    return passengers.map(toPassengerResponse);
  }
}

