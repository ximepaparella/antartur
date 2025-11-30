/**
 * Validators Zod para TourAdditional
 */

import { z } from "zod";
import { idSchema, currencyCodeSchema, priceSchema } from "@/lib/validation/schemas";

/**
 * Schema para crear un TourAdditionalPrice
 */
export const createTourAdditionalPriceSchema = z.object({
  tourAdditionalId: idSchema,
  currency: currencyCodeSchema,
  priceAdult: priceSchema,
  priceChild: priceSchema,
});

export type CreateTourAdditionalPriceInput = z.infer<typeof createTourAdditionalPriceSchema>;

/**
 * Schema para actualizar un TourAdditionalPrice
 */
export const updateTourAdditionalPriceSchema = createTourAdditionalPriceSchema.partial();

export type UpdateTourAdditionalPriceInput = z.infer<typeof updateTourAdditionalPriceSchema>;

/**
 * Schema para crear un TourAdditional
 */
export const createTourAdditionalSchema = z.object({
  tourId: idSchema,
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
  prices: z.array(createTourAdditionalPriceSchema).optional(),
});

export type CreateTourAdditionalInput = z.infer<typeof createTourAdditionalSchema>;

/**
 * Schema para actualizar un TourAdditional
 */
export const updateTourAdditionalSchema = createTourAdditionalSchema.partial().extend({
  tourId: idSchema.optional(),
});

export type UpdateTourAdditionalInput = z.infer<typeof updateTourAdditionalSchema>;

/**
 * Schema para parámetros de ruta (ID de TourAdditional)
 */
export const tourAdditionalIdParamsSchema = z.object({
  id: idSchema,
});

export type TourAdditionalIdParams = z.infer<typeof tourAdditionalIdParamsSchema>;

