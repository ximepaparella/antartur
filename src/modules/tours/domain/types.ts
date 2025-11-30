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

export interface UpdateTourInput extends Partial<CreateTourInput> {}

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

