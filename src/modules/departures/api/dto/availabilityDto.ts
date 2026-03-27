/**
 * Data Transfer Objects (DTOs) para Availability
 * Transformaciones entre TourDeparture (DB) y Availability format (API)
 * El horario (startTime/endTime) viene del tour, no del departure.
 */

import type { TourDeparture } from "@prisma/client";
import { toArDateKey } from "@/lib/utils/dateTimeAr";

/**
 * DTO de respuesta para Availability (mapeo de TourDeparture + horario del tour)
 */
export interface AvailabilityResponse {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (del tour)
  endTime: string | null; // HH:mm (del tour)
  available: number; // seatsTotal - seatsHeld - seatsConfirmed
  seatsTotal: number;
  seatsHeld: number;
  seatsConfirmed: number;
  isActive: boolean;
}

export interface TourScheduleDefaults {
  defaultStartTime: string | null;
  defaultEndTime: string | null;
}

/**
 * Transforma un TourDeparture a AvailabilityResponse usando el horario del tour
 */
export function toAvailabilityResponse(
  departure: TourDeparture,
  schedule: TourScheduleDefaults
): AvailabilityResponse {
  const available = departure.seatsTotal - departure.seatsHeld - departure.seatsConfirmed;
  const startTime = schedule.defaultStartTime?.trim() ? schedule.defaultStartTime.trim() : "09:00";
  const endTime = schedule.defaultEndTime?.trim() || null;

  return {
    id: departure.id,
    date: toArDateKey(departure.departureDate), // YYYY-MM-DD
    startTime,
    endTime,
    available: Math.max(0, available),
    seatsTotal: departure.seatsTotal,
    seatsHeld: departure.seatsHeld,
    seatsConfirmed: departure.seatsConfirmed,
    isActive: departure.isActive,
  };
}

/**
 * DTO de respuesta para Availability con detalles adicionales
 */
export interface AvailabilityDetailResponse extends AvailabilityResponse {
  tourId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transforma un TourDeparture a AvailabilityDetailResponse
 */
export function toAvailabilityDetailResponse(
  departure: TourDeparture,
  schedule: TourScheduleDefaults
): AvailabilityDetailResponse {
  const base = toAvailabilityResponse(departure, schedule);
  return {
    ...base,
    tourId: departure.tourId,
    createdAt: departure.createdAt.toISOString(),
    updatedAt: departure.updatedAt.toISOString(),
  };
}

