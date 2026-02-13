/**
 * @swagger
 * /api/payments/payway/process:
 *   post:
 *     summary: Procesar pago de Payway usando token generado por el SDK
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, token, bin, lastFourDigits]
 *             properties:
 *               orderId:
 *                 type: string
 *               token:
 *                 type: string
 *                 description: Token generado por el SDK de JavaScript
 *               bin:
 *                 type: string
 *                 description: Primeros 6 dígitos de la tarjeta
 *               lastFourDigits:
 *                 type: string
 *                 description: Últimos 4 dígitos de la tarjeta
 *     responses:
 *       200:
 *         description: Pago procesado exitosamente
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
 *                     status:
 *                       type: string
 *                       enum: [approved, rejected, pending]
 *                     transactionId:
 *                       type: string
 *                     message:
 *                       type: string
 */

import { NextRequest } from "next/server";
import { processPaywayPayment } from "@/modules/payments/infra/paywayService";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse, errorResponse } from "@/lib/api/response";
import { validateBody } from "@/lib/validation/schemas";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/services/logger";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { confirmPayment } from "@/modules/orders/domain/orderService";

const processPaywayPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  token: z.string().min(1, "Token is required"),
  bin: z.string().length(6, "BIN must be 6 digits"),
  lastFourDigits: z.string().length(4, "Last four digits must be 4 digits"),
});

export const POST = withRateLimitHandler(
  "write",
  withControllerErrorHandler(async (request: NextRequest, context) => {
    const body = await request.json();
    const data = validateBody(processPaywayPaymentSchema, body);

    // Verificar que la orden existe
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        payments: {
          where: { provider: "PAYWAY" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!order) {
      throw new NotFoundError("Order", data.orderId);
    }

    // Verificar que la orden está en estado PENDING_PAYMENT
    if (order.status !== "PENDING_PAYMENT") {
      throw new ValidationError(
        `Order ${data.orderId} is not in PENDING_PAYMENT status. Current status: ${order.status}`
      );
    }

    // Obtener el monto total de la orden
    const orderAmount = Number(order.totalAmount);
    const currency = order.currency || "ARS";

    logger.info("Processing Payway payment", {
      orderId: data.orderId,
      amount: orderAmount,
      currency,
      hasToken: !!data.token,
    });

    // Procesar el pago con Payway
    const paymentResult = await processPaywayPayment({
      token: data.token,
      orderId: data.orderId,
      amount: orderAmount,
      currency,
      bin: data.bin,
      lastFourDigits: data.lastFourDigits,
    });

    // Actualizar o crear registro de pago en BD
    const existingPayment = order.payments[0];
    const paymentData = {
      provider: "PAYWAY" as const,
      providerPaymentId: paymentResult.transactionId || `token-${data.token.slice(0, 8)}`,
      status:
        paymentResult.status === "approved"
          ? ("APPROVED" as const)
          : paymentResult.status === "pending"
          ? ("PENDING" as const)
          : ("DECLINED" as const),
      amount: orderAmount,
      currency,
      rawRequest: {
        token: data.token.substring(0, 8) + "...", // Solo primeros 8 caracteres para logs
        bin: data.bin,
        lastFourDigits: data.lastFourDigits,
      },
      rawResponse: paymentResult.rawResponse
        ? (paymentResult.rawResponse as Record<string, unknown>)
        : undefined,
    };

    if (existingPayment) {
      // Actualizar pago existente
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: paymentData,
      });
    } else {
      // Crear nuevo registro de pago
      await prisma.payment.create({
        data: {
          orderId: data.orderId,
          ...paymentData,
        },
      });
    }

    // Si el pago fue aprobado, confirmar la orden
    if (paymentResult.status === "approved") {
      try {
        await confirmPayment({
          orderId: data.orderId,
          provider: "PAYWAY",
          providerPaymentId: paymentResult.transactionId || "",
          amount: orderAmount,
          currency,
        });

        logger.info("Payway payment confirmed and order updated", {
          orderId: data.orderId,
          transactionId: paymentResult.transactionId,
        });
      } catch (confirmError) {
        logger.error("Error confirming Payway payment", confirmError, {
          orderId: data.orderId,
        });
        // No lanzar error aquí, el pago ya fue procesado exitosamente
        // Solo loguear el error
      }
    }

    // Retornar resultado
    if (paymentResult.status === "approved") {
      return successResponse({
        status: "approved",
        transactionId: paymentResult.transactionId,
        message: paymentResult.message || "Pago aprobado exitosamente",
      });
    } else if (paymentResult.status === "pending") {
      return successResponse({
        status: "pending",
        transactionId: paymentResult.transactionId,
        message: paymentResult.message || "El pago está pendiente de confirmación",
      });
    } else {
      // Pago rechazado o error
      return errorResponse(
        paymentResult.message || "El pago no pudo ser procesado",
        paymentResult.status || "PAYMENT_ERROR",
        400
      );
    }
  })
);
