/**
 * Controller para Passengers
 * Solo orquesta: valida entrada, llama servicios, transforma salida
 */

import { PassengerService } from "../../domain/passengerService";
import { toPassengerResponse } from "../dto/passengersDto";

const passengerService = new PassengerService();

export class PassengersController {
  /**
   * Obtener pasajero por ID
   */
  async getById(id: string) {
    const passenger = await passengerService.getPassengerById(id);
    return toPassengerResponse(passenger);
  }

  /**
   * Obtener pasajeros de un booking
   */
  async getByBookingId(bookingId: string) {
    const passengers = await passengerService.getPassengersByBookingId(bookingId);
    return passengers.map(toPassengerResponse);
  }
}

