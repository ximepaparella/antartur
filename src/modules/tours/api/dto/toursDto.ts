/**
 * Data Transfer Objects (DTOs) para Tours
 * Transformaciones entre modelos de dominio y respuestas de API
 */

import type {
  Tour as PrismaTour,
  TourImage,
  TourDeparture,
  TourPrice,
  TourTimelineItem,
  TourFeaturedInfo,
  TourTestimonial,
  TourQuickInfoItem,
} from "@prisma/client";
import type { Tour as DomainTour } from "../../domain/types";
import { toAvailabilityResponse, type AvailabilityResponse } from "../../../departures/api/dto/availabilityDto";
import { toTourPriceResponse, type TourPriceResponse } from "./tourPriceDto";

/**
 * Tour con relaciones opcionales
 */
export type TourWithRelations = PrismaTour & {
  images?: TourImage[];
  departures?: TourDeparture[];
  prices?: TourPrice[];
  timelineItems?: TourTimelineItem[];
  featuredInfos?: TourFeaturedInfo[];
  testimonials?: TourTestimonial[];
  quickInfoItems?: TourQuickInfoItem[];
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
  featuredImage: string;
  heroImage: string;
  heroSubheadline: string | null;
  shortDescription: string;
  longDescription: string;
  restrictionText: string;
  isActive: boolean;
  prices: TourPriceResponse[];
  // SEO
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  // QuickInfo CTA
  ctaLabel: string | null;
  ctaHref: string | null;
  // Alternative pricing
  alternativeText: string | null;
  alternativePrice: string | null;
  // Timeline note
  timelineImportantNote: string | null;
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
 * DTO de respuesta para Tour completo (con imágenes, disponibilidad y contenido)
 */
export interface TourFullResponse extends TourWithImagesResponse {
  availability: AvailabilityResponse[];
  timelineItems?: TimelineItemResponse[];
  featuredInfos?: FeaturedInfoResponse[];
  testimonials?: TestimonialResponse[];
  quickInfoItems?: QuickInfoItemResponse[];
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
 * DTO de respuesta para TimelineItem
 */
export interface TimelineItemResponse {
  id: string;
  tourId: string;
  timeLabel: string;
  title: string;
  description: string;
  sortOrder: number;
}

/**
 * DTO de respuesta para FeaturedInfo
 */
export interface FeaturedInfoResponse {
  id: string;
  tourId: string;
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
}

/**
 * DTO de respuesta para Testimonial
 */
export interface TestimonialResponse {
  id: string;
  tourId: string;
  text: string;
  author: string;
  avatar: string;
  country: string;
  sortOrder: number;
}

/**
 * DTO de respuesta para QuickInfoItem
 */
export interface QuickInfoItemResponse {
  id: string;
  tourId: string;
  icon: string;
  label: string;
  value: string;
  sortOrder: number;
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
    featuredImage: tour.featuredImage,
    heroImage: tour.heroImage,
    heroSubheadline: tour.heroSubheadline,
    shortDescription: tour.shortDescription,
    longDescription: tour.longDescription,
    restrictionText: tour.restrictionText,
    isActive: tour.isActive,
    prices: tour.prices?.map(toTourPriceResponse) || [],
    // SEO
    metaTitle: tour.metaTitle,
    metaDescription: tour.metaDescription,
    canonicalUrl: tour.canonicalUrl,
    ogImage: tour.ogImage,
    // QuickInfo CTA
    ctaLabel: tour.ctaLabel,
    ctaHref: tour.ctaHref,
    // Alternative pricing
    alternativeText: tour.alternativeText,
    alternativePrice: tour.alternativePrice,
    // Timeline note
    timelineImportantNote: tour.timelineImportantNote,
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
 * Transforma un TourTimelineItem a TimelineItemResponse
 */
export function toTimelineItemResponse(item: TourTimelineItem): TimelineItemResponse {
  return {
    id: item.id,
    tourId: item.tourId,
    timeLabel: item.timeLabel,
    title: item.title,
    description: item.description,
    sortOrder: item.sortOrder,
  };
}

/**
 * Transforma un TourFeaturedInfo a FeaturedInfoResponse
 */
export function toFeaturedInfoResponse(item: TourFeaturedInfo): FeaturedInfoResponse {
  return {
    id: item.id,
    tourId: item.tourId,
    icon: item.icon,
    title: item.title,
    description: item.description,
    sortOrder: item.sortOrder,
  };
}

/**
 * Transforma un TourTestimonial a TestimonialResponse
 */
export function toTestimonialResponse(item: TourTestimonial): TestimonialResponse {
  return {
    id: item.id,
    tourId: item.tourId,
    text: item.text,
    author: item.author,
    avatar: item.avatar,
    country: item.country,
    sortOrder: item.sortOrder,
  };
}

/**
 * Transforma un TourQuickInfoItem a QuickInfoItemResponse
 */
export function toQuickInfoItemResponse(item: TourQuickInfoItem): QuickInfoItemResponse {
  return {
    id: item.id,
    tourId: item.tourId,
    icon: item.icon,
    label: item.label,
    value: item.value,
    sortOrder: item.sortOrder,
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
    timelineItems: tour.timelineItems?.map(toTimelineItemResponse),
    featuredInfos: tour.featuredInfos?.map(toFeaturedInfoResponse),
    testimonials: tour.testimonials?.map(toTestimonialResponse),
    quickInfoItems: tour.quickInfoItems?.map(toQuickInfoItemResponse),
  };
}

