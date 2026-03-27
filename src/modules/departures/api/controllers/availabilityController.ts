/**
 * Controller para Availability (TourDepartures)
 * Solo orquesta: valida entrada, llama servicios, transforma salida
 * El horario (startTime/endTime) se toma del tour.
 * Aplica antelación mínima de reserva (settings: 24, 48 o 72 hs).
 */

import { DepartureService } from "../../domain/departureService";
import { TourRepository } from "@/modules/tours/infra/tourRepository";
import { getSiteSettings } from "@/modules/settings/repository";
import {
  getMinimumBookableDate,
  isDepartureBookableByAdvance,
} from "../../lib/advanceBookingFilter";
import { validateBody } from "@/lib/validation/schemas";
import {
  createAvailabilitySchema,
  updateAvailabilitySchema,
  type CreateAvailabilityInput,
  type UpdateAvailabilityInput,
  type TourAvailabilityQuery,
} from "../validators/availabilityValidators";
import {
  toAvailabilityResponse,
  toAvailabilityDetailResponse,
  type TourScheduleDefaults,
} from "../dto/availabilityDto";

const departureService = new DepartureService();
const tourRepository = new TourRepository();

function scheduleFromTour(tour: { defaultStartTime: string | null; defaultEndTime: string | null }): TourScheduleDefaults {
  return {
    defaultStartTime: tour.defaultStartTime,
    defaultEndTime: tour.defaultEndTime,
  };
}

export class AvailabilityController {
  /**
   * Obtener disponibilidad de un tour
   */
  async getByTourId(
    tourId: string,
    query: TourAvailabilityQuery,
    options?: { includeUnbookable?: boolean }
  ) {
    const [departures, tour, settings] = await Promise.all([
      departureService.getAvailabilityByTourId(tourId, query),
      tourRepository.findById(tourId),
      getSiteSettings(),
    ]);
    const hours = settings.minimumAdvanceBookingHours ?? 24;
    const minimumBookableDate = getMinimumBookableDate(hours);
    const includeUnbookable = options?.includeUnbookable === true;
    const filtered = includeUnbookable
      ? departures
      : departures.filter((d) => isDepartureBookableByAdvance(d, minimumBookableDate));
    const schedule = tour ? scheduleFromTour(tour) : { defaultStartTime: "09:00", defaultEndTime: null };
    return filtered.map((d) => toAvailabilityResponse(d, schedule));
  }

  /**
   * Obtener disponibilidad para una fecha específica
   */
  async getByTourIdAndDate(tourId: string, date: string, options?: { includeUnbookable?: boolean }) {
    const [departures, tour, settings] = await Promise.all([
      departureService.getAvailabilityByTourIdAndDate(tourId, date),
      tourRepository.findById(tourId),
      getSiteSettings(),
    ]);
    const hours = settings.minimumAdvanceBookingHours ?? 24;
    const minimumBookableDate = getMinimumBookableDate(hours);
    const includeUnbookable = options?.includeUnbookable === true;
    const filtered = includeUnbookable
      ? departures
      : departures.filter((d) => isDepartureBookableByAdvance(d, minimumBookableDate));
    const schedule = tour ? scheduleFromTour(tour) : { defaultStartTime: "09:00", defaultEndTime: null };
    return filtered.map((d) => toAvailabilityResponse(d, schedule));
  }

  /**
   * Obtener availability por ID
   */
  async getById(id: string) {
    const departure = await departureService.getAvailabilityById(id);
    const tour = departure ? await tourRepository.findById(departure.tourId) : null;
    const schedule = tour ? scheduleFromTour(tour) : { defaultStartTime: "09:00", defaultEndTime: null };
    return toAvailabilityDetailResponse(departure, schedule);
  }

  /**
   * Crear nueva availability
   */
  async create(body: unknown) {
    const data = validateBody(createAvailabilitySchema, body);
    const departure = await departureService.createAvailability(data);
    const tour = await tourRepository.findById(departure.tourId);
    const schedule = tour ? scheduleFromTour(tour) : { defaultStartTime: "09:00", defaultEndTime: null };
    return toAvailabilityDetailResponse(departure, schedule);
  }

  /**
   * Actualizar availability
   */
  async update(id: string, body: unknown) {
    const data = validateBody(updateAvailabilitySchema, body);
    const updated = await departureService.updateAvailability(id, data);
    const tour = await tourRepository.findById(updated.tourId);
    const schedule = tour ? scheduleFromTour(tour) : { defaultStartTime: "09:00", defaultEndTime: null };
    return toAvailabilityDetailResponse(updated, schedule);
  }

  /**
   * Eliminar availability
   */
  async delete(id: string) {
    await departureService.deleteAvailability(id);
    return null;
  }
}

