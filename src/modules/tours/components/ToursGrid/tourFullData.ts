import tourExampleJson from "./tourExample.json";
import type { Tour } from "@/modules/tours/types/tourTypes";

export type TourFullData = Record<string, Tour>;

export const tourFullData: TourFullData = tourExampleJson as TourFullData;

/**
 * Obtiene los datos completos de un tour por su ID
 */
export function getFullTourById(id: string): Tour | undefined {
  return tourFullData[id];
}

/**
 * Obtiene todos los tours completos como array
 */
export function getAllFullTours(): Tour[] {
  return Object.values(tourFullData);
}

