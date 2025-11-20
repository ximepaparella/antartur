/**
 * Validators Zod para Payments
 */

import { z } from "zod";
import { idSchema, currencyCodeSchema, priceSchema } from "@/lib/validation/schemas";

/**
 * Schema para crear un Payment
 */
export const createPaymentSchema = z.object({
  orderId: idSchema,
  provider: z.string().min(1, "Provider is required"),
  providerPaymentId: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "DECLINED", "REFUNDED"]),
  amount: priceSchema,
  currency: currencyCodeSchema,
  paidAt: z.string().datetime().optional(),
  rawRequest: z.record(z.unknown()).optional(),
  rawResponse: z.record(z.unknown()).optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

/**
 * Schema para webhook de PayPal
 */
export const paypalWebhookSchema = z.object({
  event_type: z.string(),
  resource: z.record(z.unknown()),
});

export type PayPalWebhookInput = z.infer<typeof paypalWebhookSchema>;

/**
 * Schema para webhook de Payway
 */
export const paywayWebhookSchema = z.object({
  payment_id: z.string(),
  status: z.string(),
  amount: z.number(),
  currency: z.string(),
  order_id: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type PaywayWebhookInput = z.infer<typeof paywayWebhookSchema>;

/**
 * Schema para parámetros de ruta (ID)
 */
export const paymentIdParamsSchema = z.object({
  id: idSchema,
});

export type PaymentIdParams = z.infer<typeof paymentIdParamsSchema>;

