/**
 * Data Transfer Objects (DTOs) para Availability
 * Transformaciones entre TourDeparture (DB) y Availability format (API)
 */

import type { TourDeparture } from "@prisma/client";

/**
 * DTO de respuesta para Availability (mapeo de TourDeparture)
 */
export interface AvailabilityResponse {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string | null; // HH:mm
  available: number; // seatsTotal - seatsHeld - seatsConfirmed
  seatsTotal: number;
  seatsHeld: number;
  seatsConfirmed: number;
  isActive: boolean;
}

/**
 * Transforma un TourDeparture a AvailabilityResponse
 */
export function toAvailabilityResponse(departure: TourDeparture): AvailabilityResponse {
  const available = departure.seatsTotal - departure.seatsHeld - departure.seatsConfirmed;
  
  return {
    id: departure.id,
    date: departure.departureDate.toISOString().split("T")[0], // YYYY-MM-DD
    startTime: departure.startTime,
    endTime: departure.endTime,
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
export function toAvailabilityDetailResponse(departure: TourDeparture): AvailabilityDetailResponse {
  const base = toAvailabilityResponse(departure);
  return {
    ...base,
    tourId: departure.tourId,
    createdAt: departure.createdAt.toISOString(),
    updatedAt: departure.updatedAt.toISOString(),
  };
}

