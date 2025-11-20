/**
 * Validators Zod para Bookings
 */

import { z } from "zod";
import { idSchema } from "@/lib/validation/schemas";

/**
 * Schema para parámetros de ruta (ID)
 */
export const bookingIdParamsSchema = z.object({
  id: idSchema,
});

export type BookingIdParams = z.infer<typeof bookingIdParamsSchema>;

/**
 * Schema para actualizar estado de booking
 */
export const updateBookingStatusSchema = z.object({
  status: z.enum(["HELD", "CONFIRMED", "CANCELLED"]),
});

export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;

/**
 * Schema para query parameters de bookings por order
 */
export const orderBookingsQuerySchema = z.object({
  includePassengers: z.coerce.boolean().optional().default(false),
});

export type OrderBookingsQuery = z.infer<typeof orderBookingsQuerySchema>;

