/**
 * Validators Zod para TourPrices
 */

import { z } from "zod";
import { idSchema, currencyCodeSchema, priceSchema } from "@/lib/validation/schemas";

/**
 * Schema para crear un TourPrice
 */
export const createTourPriceSchema = z.object({
  tourId: idSchema,
  currency: currencyCodeSchema,
  priceAdult: priceSchema,
  priceChild: priceSchema,
  // Nuevos campos para sistema de rangos de edad
  priceInfantFree: z.boolean().default(false),
  childAgeRange: z.string().optional().nullable(),
  childPriceType: z.enum(["FULL_CHILD_PRICE", "HALF_ADULT_PRICE", "ADULT_PRICE"]).default("FULL_CHILD_PRICE"),
  infantMaxAge: z.coerce.number().int().min(0).max(12).default(3),
});

export type CreateTourPriceInput = z.infer<typeof createTourPriceSchema>;

/**
 * Schema para actualizar un TourPrice
 */
export const updateTourPriceSchema = z.object({
  priceAdult: priceSchema.optional(),
  priceChild: priceSchema.optional(),
  priceInfantFree: z.boolean().optional(),
  childAgeRange: z.string().optional().nullable(),
  childPriceType: z.enum(["FULL_CHILD_PRICE", "HALF_ADULT_PRICE", "ADULT_PRICE"]).optional(),
  infantMaxAge: z.coerce.number().int().min(0).max(12).optional(),
});

export type UpdateTourPriceInput = z.infer<typeof updateTourPriceSchema>;

