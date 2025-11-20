/**
 * Validators Zod para Tours
 */

import { z } from "zod";
import { paginationSchema, commonFiltersSchema, idSchema, slugSchema, currencyCodeSchema, priceSchema } from "@/lib/validation/schemas";

/**
 * Schema para crear un Tour
 */
export const createTourSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, "Name is required").max(200),
  subtitle: z.string().max(300).optional(),
  category: z.string().min(1, "Category is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  durationHours: z.coerce.number().int().positive("Duration must be positive"),
  baseCurrency: currencyCodeSchema,
  basePriceAdult: priceSchema,
  basePriceChild: priceSchema,
  featuredImage: z.string().url("Featured image must be a valid URL").or(z.string().startsWith("/")),
  heroImage: z.string().url("Hero image must be a valid URL").or(z.string().startsWith("/")),
  shortDescription: z.string().min(1, "Short description is required"),
  longDescription: z.string().min(1, "Long description is required"),
  restrictionText: z.string().optional().default(""),
  isActive: z.boolean().default(true),
});

export type CreateTourInput = z.infer<typeof createTourSchema>;

/**
 * Schema para actualizar un Tour
 */
export const updateTourSchema = createTourSchema.partial().extend({
  slug: slugSchema.optional(),
});

export type UpdateTourInput = z.infer<typeof updateTourSchema>;

/**
 * Schema para query parameters de listar tours
 */
export const listToursQuerySchema = paginationSchema.merge(commonFiltersSchema).extend({
  category: z.string().optional(),
  difficulty: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type ListToursQuery = z.infer<typeof listToursQuerySchema>;

/**
 * Schema para parámetros de ruta (ID)
 */
export const tourIdParamsSchema = z.object({
  id: idSchema,
});

export type TourIdParams = z.infer<typeof tourIdParamsSchema>;

/**
 * Schema para parámetros de ruta (slug)
 */
export const tourSlugParamsSchema = z.object({
  slug: slugSchema,
});

export type TourSlugParams = z.infer<typeof tourSlugParamsSchema>;

