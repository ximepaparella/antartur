/**
 * Validators Zod para Orders
 */

import { z } from "zod";
import { idSchema, emailSchema, phoneSchema, currencyCodeSchema, priceSchema } from "@/lib/validation/schemas";

/**
 * Schema para crear una Order (Reservation)
 * Acepta departureId directamente O tourId (slug) + date + startTime
 */
export const createOrderSchema = z.object({
  tourId: idSchema, // Puede ser slug o ID
  departureId: idSchema.optional(), // Opcional si se proporciona date + startTime
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // YYYY-MM-DD
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), // HH:mm
  numAdults: z.coerce.number().int().positive("Number of adults must be positive"),
  numChildren: z.coerce.number().int().min(0, "Number of children cannot be negative"),
  numInfants: z.coerce.number().int().min(0, "Number of infants cannot be negative").optional(),
  currency: currencyCodeSchema,
  customerName: z.string().min(1, "Customer name is required").max(200),
  customerEmail: emailSchema,
  customerPhone: phoneSchema,
  passengers: z.array(
    z.object({
      type: z.enum(["ADULT", "CHILD", "INFANT"]),
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      documentType: z.string().optional(),
      documentNumber: z.string().optional(),
      nationality: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      restrictions: z.record(z.unknown()).optional(),
    })
  ).min(1, "At least one passenger is required"),
  notes: z.string().optional(),
  // Nuevos campos para checkout completo
  paymentMethod: z.enum(["transferencia", "paypal", "payway"]).optional(),
  exceedsAvailability: z.boolean().optional().default(false),
  hasRestrictionViolations: z.boolean().optional().default(false),
  additionals: z.array(
    z.object({
      additionalId: idSchema,
      name: z.string().min(1),
      priceAdult: priceSchema,
      priceChild: priceSchema,
      currency: currencyCodeSchema,
    })
  ).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/**
 * Schema para query parameters de listar orders
 */
export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(10).optional(),
  status: z.enum(["PENDING_PAYMENT", "PAID", "CANCELLED", "EXPIRED", "COMPLETED"]).optional(),
  type: z.enum(["RESERVATION", "ENQUIRY"]).optional(),
  customerEmail: emailSchema.optional(),
});

export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;

/**
 * Schema para parámetros de ruta (ID)
 */
export const orderIdParamsSchema = z.object({
  id: idSchema,
});

export type OrderIdParams = z.infer<typeof orderIdParamsSchema>;

/**
 * Schema para parámetros de ruta (code)
 */
export const orderCodeParamsSchema = z.object({
  code: z.string().min(1, "Order code is required"),
});

export type OrderCodeParams = z.infer<typeof orderCodeParamsSchema>;

/**
 * Schema para actualizar estado de orden
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING_PAYMENT", "PAID", "CANCELLED", "EXPIRED", "COMPLETED"]),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

