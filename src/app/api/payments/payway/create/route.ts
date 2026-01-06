/**
 * @swagger
 * /api/payments/payway/create:
 *   post:
 *     summary: Crear transacción de pago Payway y obtener URL de redirect
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, amount, currency, customerEmail, customerName]
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [ARS]
 *               customerEmail:
 *                 type: string
 *               customerName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transacción de Payway creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     redirectUrl:
 *                       type: string
 *                     paywayTransactionId:
 *                       type: string
 */

import { NextRequest } from "next/server";
import { createPaywayTransaction } from "@/modules/payments/infra/paywayService";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";
import { validateBody } from "@/lib/validation/schemas";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/services/logger";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";

const createPaywayTransactionSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum(["ARS"], { errorMap: () => ({ message: "Currency must be ARS for Payway" }) }),
  customerEmail: z.string().email("Invalid email address"),
  customerName: z.string().min(1, "Customer name is required"),
});

export const POST = withRateLimitHandler("write", withControllerErrorHandler(async (request: NextRequest, context) => {
  const body = await request.json();
  const data = validateBody(createPaywayTransactionSchema, body);

  // Verificar que la orden existe
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
  });

  if (!order) {
    throw new NotFoundError(`Order ${data.orderId} not found`);
  }

  // Verificar que la orden está en estado PENDING_PAYMENT
  if (order.status !== "PENDING_PAYMENT") {
    throw new ValidationError(`Order ${data.orderId} is not in PENDING_PAYMENT status`);
  }

  // Verificar que el monto coincide
  const orderAmount = Number(order.totalAmount);
  if (Math.abs(orderAmount - data.amount) > 0.01) {
    throw new ValidationError(`Amount mismatch. Order amount: ${orderAmount}, provided: ${data.amount}`);
  }

  // Crear transacción en Payway
  // Usar SITE_URL (servidor) o NEXT_PUBLIC_SITE_URL (cliente), con fallback a URL de producción actual
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://coderoots.tech";
  const returnUrl = `${siteUrl}/checkout/payway/return?orderId=${data.orderId}`;
  const cancelUrl = `${siteUrl}/checkout/payment-error?orderId=${data.orderId}&reason=cancelled`;

  const paywayTransaction = await createPaywayTransaction({
    orderId: data.orderId,
    amount: data.amount,
    currency: data.currency,
    customerEmail: data.customerEmail,
    customerName: data.customerName,
    returnUrl,
    cancelUrl,
  });

  // Crear registro de pago en BD con status PENDING
  await prisma.payment.create({
    data: {
      orderId: data.orderId,
      provider: "PAYWAY",
      providerPaymentId: paywayTransaction.paywayTransactionId,
      status: "PENDING",
      amount: data.amount,
      currency: data.currency,
      rawRequest: {
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
      },
    },
  });

  logger.info("Payway payment created", {
    orderId: data.orderId,
    paywayTransactionId: paywayTransaction.paywayTransactionId,
  });

  return successResponse({
    redirectUrl: paywayTransaction.redirectUrl,
    paywayTransactionId: paywayTransaction.paywayTransactionId,
  });
}));

