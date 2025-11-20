/**
 * Data Transfer Objects (DTOs) para Tours
 * Transformaciones entre modelos de dominio y respuestas de API
 */

import type { Tour as PrismaTour, TourImage, TourDeparture } from "@prisma/client";
import type { Tour as DomainTour } from "../../domain/types";
import { toAvailabilityResponse, type AvailabilityResponse } from "../../../departures/api/dto/availabilityDto";

/**
 * Tour con relaciones opcionales
 */
export type TourWithRelations = PrismaTour & {
  images?: TourImage[];
  departures?: TourDeparture[];
};

/**
 * DTO de respuesta para Tour (sin relaciones)
 */
export interface TourResponse {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  category: string;
  difficulty: string;
  durationHours: number;
  baseCurrency: string;
  basePriceAdult: number;
  basePriceChild: number;
  featuredImage: string;
  heroImage: string;
  shortDescription: string;
  longDescription: string;
  restrictionText: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO de respuesta para Tour con imágenes
 */
export interface TourWithImagesResponse extends TourResponse {
  images: TourImageResponse[];
}

/**
 * DTO de respuesta para Tour completo (con imágenes y disponibilidad)
 */
export interface TourFullResponse extends TourWithImagesResponse {
  availability: AvailabilityResponse[];
}

/**
 * DTO de respuesta para TourImage
 */
export interface TourImageResponse {
  id: string;
  tourId: string;
  imageType: string;
  url: string;
  altText: string;
  sortOrder: number;
  createdAt: string;
}

/**
 * Transforma un Tour de Prisma a TourResponse
 */
export function toTourResponse(tour: TourWithRelations): TourResponse {
  return {
    id: tour.id,
    slug: tour.slug,
    name: tour.name,
    subtitle: tour.subtitle,
    category: tour.category,
    difficulty: tour.difficulty,
    durationHours: tour.durationHours,
    baseCurrency: tour.baseCurrency,
    basePriceAdult: Number(tour.basePriceAdult),
    basePriceChild: Number(tour.basePriceChild),
    featuredImage: tour.featuredImage,
    heroImage: tour.heroImage,
    shortDescription: tour.shortDescription,
    longDescription: tour.longDescription,
    restrictionText: tour.restrictionText,
    isActive: tour.isActive,
    createdAt: tour.createdAt.toISOString(),
    updatedAt: tour.updatedAt.toISOString(),
  };
}

/**
 * Transforma un TourImage a TourImageResponse
 */
export function toTourImageResponse(image: TourImage): TourImageResponse {
  return {
    id: image.id,
    tourId: image.tourId,
    imageType: image.imageType,
    url: image.url,
    altText: image.altText,
    sortOrder: image.sortOrder,
    createdAt: image.createdAt.toISOString(),
  };
}

/**
 * Transforma un TourDeparture a AvailabilityResponse
 * Re-exportado desde departures/api/dto/availabilityDto para mantener consistencia
 */
export { toAvailabilityResponse, type AvailabilityResponse } from "../../../departures/api/dto/availabilityDto";

/**
 * Transforma un Tour con imágenes a TourWithImagesResponse
 */
export function toTourWithImagesResponse(tour: TourWithRelations): TourWithImagesResponse {
  const base = toTourResponse(tour);
  return {
    ...base,
    images: tour.images?.map(toTourImageResponse) || [],
  };
}

/**
 * Transforma un Tour completo a TourFullResponse
 */
export function toTourFullResponse(tour: TourWithRelations): TourFullResponse {
  const base = toTourWithImagesResponse(tour);
  return {
    ...base,
    availability: tour.departures?.map(toAvailabilityResponse) || [],
  };
}

