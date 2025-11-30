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
  // Nuevos campos para sistema de rangos de edad
  priceInfantFree: boolean;
  childAgeRange: string | null;
  childPriceType: "FULL_CHILD_PRICE" | "HALF_ADULT_PRICE" | "ADULT_PRICE";
  infantMaxAge: number;
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
    priceInfantFree: tourPrice.priceInfantFree,
    childAgeRange: tourPrice.childAgeRange,
    childPriceType: tourPrice.childPriceType,
    infantMaxAge: tourPrice.infantMaxAge,
    createdAt: tourPrice.createdAt.toISOString(),
    updatedAt: tourPrice.updatedAt.toISOString(),
  };
}

