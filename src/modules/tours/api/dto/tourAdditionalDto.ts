/**
 * Data Transfer Objects (DTOs) para TourAdditional
 * Transformaciones entre modelos de dominio y respuestas de API
 */

import type {
  TourAdditional as PrismaTourAdditional,
  TourAdditionalPrice as PrismaTourAdditionalPrice,
} from "@prisma/client";

/**
 * DTO de respuesta para TourAdditionalPrice
 */
export interface TourAdditionalPriceResponse {
  id: string;
  tourAdditionalId: string;
  currency: string;
  priceAdult: number;
  priceChild: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO de respuesta para TourAdditional
 */
export interface TourAdditionalResponse {
  id: string;
  tourId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  prices: TourAdditionalPriceResponse[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Transforma un TourAdditionalPrice de Prisma a TourAdditionalPriceResponse
 */
export function toTourAdditionalPriceResponse(
  price: PrismaTourAdditionalPrice
): TourAdditionalPriceResponse {
  return {
    id: price.id,
    tourAdditionalId: price.tourAdditionalId,
    currency: price.currency,
    priceAdult: Number(price.priceAdult),
    priceChild: Number(price.priceChild),
    createdAt: price.createdAt.toISOString(),
    updatedAt: price.updatedAt.toISOString(),
  };
}

/**
 * Transforma un TourAdditional de Prisma a TourAdditionalResponse
 */
export function toTourAdditionalResponse(
  additional: PrismaTourAdditional & { prices?: PrismaTourAdditionalPrice[] }
): TourAdditionalResponse {
  return {
    id: additional.id,
    tourId: additional.tourId,
    name: additional.name,
    description: additional.description,
    isActive: additional.isActive,
    sortOrder: additional.sortOrder,
    prices: additional.prices?.map(toTourAdditionalPriceResponse) || [],
    createdAt: additional.createdAt.toISOString(),
    updatedAt: additional.updatedAt.toISOString(),
  };
}

