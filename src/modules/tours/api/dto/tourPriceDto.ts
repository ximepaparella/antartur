/**
 * Data Transfer Objects (DTOs) para TourPrice
 * Transformaciones entre modelos de dominio y respuestas de API
 */

import type { TourPrice as PrismaTourPrice } from "@prisma/client";

/**
 * DTO de respuesta para TourPrice
 */
export interface TourPriceResponse {
  id: string;
  tourId: string;
  currency: string;
  priceAdult: number;
  priceChild: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transforma un TourPrice de Prisma a TourPriceResponse
 */
export function toTourPriceResponse(tourPrice: PrismaTourPrice): TourPriceResponse {
  return {
    id: tourPrice.id,
    tourId: tourPrice.tourId,
    currency: tourPrice.currency,
    priceAdult: Number(tourPrice.priceAdult),
    priceChild: Number(tourPrice.priceChild),
    createdAt: tourPrice.createdAt.toISOString(),
    updatedAt: tourPrice.updatedAt.toISOString(),
  };
}

