/**
 * @swagger
 * /api/payments/paypal/create:
 *   post:
 *     summary: Crear orden de pago PayPal y obtener URL de redirect
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, amount, currency]
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [USD]
 *     responses:
 *       200:
 *         description: Orden de PayPal creada exitosamente
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
 *                     paypalOrderId:
 *                       type: string
 */

import { NextRequest } from "next/server";
import { createPayPalOrder } from "@/modules/payments/infra/paypalService";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";
import { validateBody } from "@/lib/validation/schemas";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/services/logger";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";

const createPayPalOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum(["USD"], { errorMap: () => ({ message: "Currency must be USD for PayPal" }) }),
});

export const POST = withRateLimitHandler("write", withControllerErrorHandler(async (request: NextRequest, context) => {
  const body = await request.json();
  const data = validateBody(createPayPalOrderSchema, body);

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

  // Verificar que las credenciales de PayPal estén configuradas
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    logger.error("PayPal credentials not configured", {
      hasClientId: !!process.env.PAYPAL_CLIENT_ID,
      hasClientSecret: !!process.env.PAYPAL_CLIENT_SECRET,
    });
    throw new ValidationError(
      "PayPal payment gateway is not configured. Please contact support or use bank transfer instead."
    );
  }

  // Crear orden en PayPal
  // Usar SITE_URL (servidor) o NEXT_PUBLIC_SITE_URL (cliente), con fallback a URL de producción actual
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://coderoots.tech";
  const returnUrl = `${siteUrl}/checkout/paypal/return?orderId=${data.orderId}`;
  const cancelUrl = `${siteUrl}/checkout/payment-error?orderId=${data.orderId}&reason=cancelled`;

  const paypalOrder = await createPayPalOrder({
    orderId: data.orderId,
    amount: data.amount,
    currency: data.currency,
    returnUrl,
    cancelUrl,
  });

  // Crear registro de pago en BD con status PENDING
  await prisma.payment.create({
    data: {
      orderId: data.orderId,
      provider: "PAYPAL",
      providerPaymentId: paypalOrder.paypalOrderId,
      status: "PENDING",
      amount: data.amount,
      currency: data.currency,
      rawRequest: {
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
      },
    },
  });

  logger.info("PayPal payment created", {
    orderId: data.orderId,
    paypalOrderId: paypalOrder.paypalOrderId,
  });

  return successResponse({
    redirectUrl: paypalOrder.redirectUrl,
    paypalOrderId: paypalOrder.paypalOrderId,
  });
}));

