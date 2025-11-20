/**
 * Fixtures de datos de prueba para Tours
 */

import type { CreateTourInput } from "@/modules/tours/domain/types";

export const mockTourData: CreateTourInput = {
  slug: "test-tour",
  name: "Test Tour",
  subtitle: "A test tour",
  category: "summer",
  difficulty: "Baja",
  durationHours: 4,
  featuredImage: "/images/test/featured.jpg",
  heroImage: "/images/test/hero.jpg",
  shortDescription: "Short description",
  longDescription: "Long description",
  restrictionText: "No restrictions",
  isActive: true,
};

export const mockToursData: CreateTourInput[] = [
  mockTourData,
  {
    ...mockTourData,
    slug: "test-tour-2",
    name: "Test Tour 2",
    category: "winter",
  },
];

