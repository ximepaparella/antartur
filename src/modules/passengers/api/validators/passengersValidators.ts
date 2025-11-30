/**
 * Validators Zod para Passengers
 */

import { z } from "zod";
import { idSchema } from "@/lib/validation/schemas";

/**
 * Schema para parámetros de ruta (ID)
 */
export const passengerIdParamsSchema = z.object({
  id: idSchema,
});

export type PassengerIdParams = z.infer<typeof passengerIdParamsSchema>;

/**
 * Schema para parámetros de ruta (bookingId)
 */
export const bookingIdParamsSchema = z.object({
  bookingId: idSchema,
});

export type BookingIdParams = z.infer<typeof bookingIdParamsSchema>;

