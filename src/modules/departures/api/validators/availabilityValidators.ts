/**
 * Validators Zod para Availability (TourDepartures)
 */

import { z } from "zod";
import { idSchema, dateSchema } from "@/lib/validation/schemas";

/**
 * Schema para crear Availability (horario viene del tour)
 */
export const createAvailabilitySchema = z.object({
  tourId: idSchema,
  departureDate: dateSchema,
  seatsTotal: z.coerce.number().int().positive("Seats total must be positive"),
  isActive: z.boolean().default(true),
});

export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;

/**
 * Schema para actualizar Availability
 */
export const updateAvailabilitySchema = createAvailabilitySchema.partial().extend({
  tourId: idSchema.optional(),
});

export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;

/**
 * Schema para query parameters de availability por tour
 */
export const tourAvailabilityQuerySchema = z.object({
  date: dateSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

export type TourAvailabilityQuery = z.infer<typeof tourAvailabilityQuerySchema>;

/**
 * Schema para parámetros de ruta (tourId)
 */
export const tourIdParamsSchema = z.object({
  id: idSchema,
});

export type TourIdParams = z.infer<typeof tourIdParamsSchema>;

/**
 * Schema para parámetros de ruta (availabilityId)
 */
export const availabilityIdParamsSchema = z.object({
  id: idSchema,
});

export type AvailabilityIdParams = z.infer<typeof availabilityIdParamsSchema>;

/**
 * Schema para parámetros de ruta (tourId + date)
 */
export const tourDateParamsSchema = z.object({
  id: idSchema,
  date: dateSchema,
});

export type TourDateParams = z.infer<typeof tourDateParamsSchema>;

