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
});

export type CreateTourPriceInput = z.infer<typeof createTourPriceSchema>;

/**
 * Schema para actualizar un TourPrice
 */
export const updateTourPriceSchema = z.object({
  priceAdult: priceSchema.optional(),
  priceChild: priceSchema.optional(),
});

export type UpdateTourPriceInput = z.infer<typeof updateTourPriceSchema>;

