/**
 * Tipos de dominio para Tours
 */

import type { Tour as PrismaTour, TourImage as PrismaTourImage, ImageType } from "@prisma/client";

export type { ImageType };

export interface Tour extends PrismaTour {
  images?: TourImage[];
  departures?: TourDeparture[];
}

export interface TourImage extends PrismaTourImage {}

export interface TourDeparture {
  id: string;
  tourId: string;
  departureDate: Date;
  startTime: string;
  endTime?: string | null;
  seatsTotal: number;
  seatsHeld: number;
  seatsConfirmed: number;
  isActive: boolean;
}

export interface CreateTourInput {
  slug: string;
  name: string;
  subtitle?: string;
  category: string;
  difficulty: string;
  durationHours: number;
  featuredImage: string;
  heroImage: string;
  shortDescription: string;
  longDescription: string;
  restrictionText: string;
  isActive?: boolean;
}

export interface TourImageInput {
  id?: string;
  imageType: "FEATURED" | "HERO" | "GALLERY";
  url: string;
  altText: string;
  sortOrder?: number;
}

export interface TimelineItemInput {
  id?: string;
  timeLabel: string;
  title: string;
  description: string;
  sortOrder?: number;
}

export interface FeaturedInfoInput {
  id?: string;
  icon: string;
  title: string;
  description: string;
  sortOrder?: number;
}

export interface TestimonialInput {
  id?: string;
  text: string;
  author: string;
  avatar: string;
  country: string;
  sortOrder?: number;
}

export interface QuickInfoItemInput {
  id?: string;
  icon: string;
  label: string;
  value: string;
  sortOrder?: number;
}

export interface TourRestrictionInput {
  id?: string;
  text: string;
  sortOrder?: number;
}

/**
 * Input para actualizar solo campos básicos del tour (para el repositorio)
 */
export interface UpdateTourBasicInput {
  slug?: string;
  name?: string;
  subtitle?: string | null; // nullable en Prisma
  category?: string;
  difficulty?: string;
  durationHours?: number;
  featuredImage?: string;
  heroImage?: string;
  shortDescription?: string;
  longDescription?: string;
  restrictionText?: string;
  isActive?: boolean;
  // Restricciones - nullable en Prisma
  minAge?: number | null;
  minPassengers?: number | null;
  // SEO fields - nullable en Prisma
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  // CTA fields - nullable en Prisma
  ctaLabel?: string | null;
  ctaHref?: string | null;
  // Alternative pricing - nullable en Prisma
  alternativeText?: string | null;
  alternativePrice?: string | null;
  // Timeline note - nullable en Prisma
  timelineImportantNote?: string | null;
  // Hero subheadline - nullable en Prisma
  heroSubheadline?: string | null;
  // Weekdays
  mondayAvailable?: boolean;
  tuesdayAvailable?: boolean;
  wednesdayAvailable?: boolean;
  thursdayAvailable?: boolean;
  fridayAvailable?: boolean;
  saturdayAvailable?: boolean;
  sundayAvailable?: boolean;
  defaultStartTime?: string | null;
  defaultEndTime?: string | null;
}

/**
 * Input completo para actualizar tour incluyendo relaciones (para el servicio)
 */
export interface TourAdditionalInput {
  id?: string; // Para updates, omitir para crear nuevos
  name: string;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  prices?: Array<{
    currency: string;
    price: number; // Precio general (no por pasajero)
  }>;
}

export interface UpdateTourInput extends UpdateTourBasicInput {
  // Relaciones
  images?: TourImageInput[];
  timelineItems?: TimelineItemInput[];
  featuredInfos?: FeaturedInfoInput[];
  testimonials?: TestimonialInput[];
  quickInfoItems?: QuickInfoItemInput[];
  restrictions?: TourRestrictionInput[];
  // Precios
  prices?: TourPriceInput[];
  // Additionals
  additionals?: TourAdditionalInput[];
}

export interface TourPrice {
  id: string;
  tourId: string;
  currency: string;
  priceAdult: number;
  priceChild: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTourPriceInput {
  tourId: string;
  currency: string;
  priceAdult: number;
  priceChild: number;
}

export interface UpdateTourPriceInput {
  priceAdult?: number;
  priceChild?: number;
}

export interface TourPriceInput {
  id?: string;
  currency: string;
  priceAdult: number;
  priceChild: number;
}

