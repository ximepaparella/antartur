/**
 * Controller para Availability (TourDepartures)
 * Solo orquesta: valida entrada, llama servicios, transforma salida
 */

import { NextRequest } from "next/server";
import { DepartureService } from "../../domain/departureService";
import { validateQuery, validateBody } from "@/lib/validation/schemas";
import {
  createAvailabilitySchema,
  updateAvailabilitySchema,
  tourAvailabilityQuerySchema,
  type CreateAvailabilityInput,
  type UpdateAvailabilityInput,
  type TourAvailabilityQuery,
} from "../validators/availabilityValidators";
import {
  toAvailabilityResponse,
  toAvailabilityDetailResponse,
  type AvailabilityResponse,
  type AvailabilityDetailResponse,
} from "../dto/availabilityDto";

const departureService = new DepartureService();

export class AvailabilityController {
  /**
   * Obtener disponibilidad de un tour
   */
  async getByTourId(tourId: string, query: TourAvailabilityQuery) {
    const departures = await departureService.getAvailabilityByTourId(tourId, query);
    return departures.map(toAvailabilityResponse);
  }

  /**
   * Obtener disponibilidad para una fecha específica
   */
  async getByTourIdAndDate(tourId: string, date: string) {
    const departures = await departureService.getAvailabilityByTourIdAndDate(tourId, date);
    return departures.map(toAvailabilityResponse);
  }

  /**
   * Obtener availability por ID
   */
  async getById(id: string) {
    const departure = await departureService.getAvailabilityById(id);
    return toAvailabilityDetailResponse(departure);
  }

  /**
   * Crear nueva availability
   */
  async create(body: unknown) {
    const data = validateBody(createAvailabilitySchema, body);
    const departure = await departureService.createAvailability(data);
    return toAvailabilityDetailResponse(departure);
  }

  /**
   * Actualizar availability
   */
  async update(id: string, body: unknown) {
    const data = validateBody(updateAvailabilitySchema, body);
    const updated = await departureService.updateAvailability(id, data);
    return toAvailabilityDetailResponse(updated);
  }

  /**
   * Eliminar availability
   */
  async delete(id: string) {
    await departureService.deleteAvailability(id);
    return null;
  }
}

