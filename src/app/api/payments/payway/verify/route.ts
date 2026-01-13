/**
 * @swagger
 * /api/payments/payway/verify:
 *   post:
 *     summary: Verificar y confirmar pago de Payway después del retorno del checkout
 *     tags: [Payments]
 *     description: Endpoint para verificar y confirmar un pago de Payway cuando el usuario regresa del checkout. Valida la firma y confirma el pago si es exitoso.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, transactionId]
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID de la orden en nuestro sistema
 *               transactionId:
 *                 type: string
 *                 description: ID de la transacción de Payway
 *               status:
 *                 type: string
 *                 description: Estado del pago desde Payway (success, failure, pending, cancelled)
 *               signature:
 *                 type: string
 *                 description: Firma HMAC para validar la autenticidad del callback
 *               amount:
 *                 type: string
 *                 description: Monto de la transacción en centavos
 *     responses:
 *       200:
 *         description: Pago verificado y confirmado exitosamente
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
 *                     verified:
 *                       type: boolean
 *                     status:
 *                       type: string
 *                     orderId:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { NextRequest } from "next/server";
import { verifyPaywayPayment } from "@/modules/payments/infra/paywayService";
import { confirmPayment } from "@/modules/orders/domain/orderService";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";
import { validateBody } from "@/lib/validation/schemas";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/services/logger";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";

const verifyPaywayPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  transactionId: z.string().min(1, "Transaction ID is required"),
  status: z.string().optional(),
  signature: z.string().optional(),
  amount: z.string().optional(),
  // Otros parámetros que Payway puede enviar
  order_id: z.string().optional(),
  error_message: z.string().optional(),
});

export const POST = withRateLimitHandler("write", withControllerErrorHandler(async (request: NextRequest, context) => {
  const body = await request.json();
  const data = validateBody(verifyPaywayPaymentSchema, body);

  // Verificar que la orden existe
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    include: {
      payments: {
        where: {
          provider: "PAYWAY",
          providerPaymentId: data.transactionId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!order) {
    throw new NotFoundError("Order", data.orderId);
  }

  // Verificar que la orden está en estado PENDING_PAYMENT
  if (order.status !== "PENDING_PAYMENT") {
    throw new ValidationError(`Order ${data.orderId} is not in PENDING_PAYMENT status. Current status: ${order.status}`);
  }

  // Construir queryParams para verifyPaywayPayment
  const queryParams: Record<string, string> = {
    transaction_id: data.transactionId,
  };

  if (data.status) {
    queryParams.status = data.status;
  }
  if (data.signature) {
    queryParams.signature = data.signature;
  }
  if (data.amount) {
    queryParams.amount = data.amount;
  }
  if (data.order_id) {
    queryParams.order_id = data.order_id;
  }
  if (data.error_message) {
    queryParams.error_message = data.error_message;
  }

  // Verificar el pago con Payway (valida firma y estado)
  const verificationResult = await verifyPaywayPayment(data.transactionId, queryParams);

  logger.info("Payway payment verification", {
    orderId: data.orderId,
    transactionId: data.transactionId,
    verificationResult,
  });

  // Si la verificación falló (firma inválida, etc.)
  if (!verificationResult.success) {
    // Actualizar el pago en BD con el estado de error
    const existingPayment = order.payments[0];
    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: verificationResult.status === "invalid_signature" ? "FAILED" : "PENDING",
          rawResponse: {
            ...(existingPayment.rawResponse as Record<string, unknown> || {}),
            verificationError: verificationResult.message,
            verificationStatus: verificationResult.status,
            verifiedAt: new Date().toISOString(),
          },
        },
      });
    }

    return successResponse({
      verified: false,
      status: verificationResult.status,
      message: verificationResult.message,
      orderId: data.orderId,
    });
  }

  // Si el pago fue exitoso, confirmarlo
  if (verificationResult.status === "approved" && verificationResult.orderId) {
    try {
      const amount = verificationResult.amount || Number(order.totalAmount);
      
      await confirmPayment({
        orderId: verificationResult.orderId,
        provider: "PAYWAY",
        providerPaymentId: data.transactionId,
        amount: amount,
        currency: order.currency || "ARS",
        rawRequest: queryParams,
        rawResponse: {
          status: verificationResult.status,
          verified: true,
        },
      });

      logger.info("Payway payment confirmed", {
        orderId: verificationResult.orderId,
        transactionId: data.transactionId,
        amount,
      });

      return successResponse({
        verified: true,
        status: "approved",
        orderId: verificationResult.orderId,
        message: "Pago verificado y confirmado exitosamente",
      });
    } catch (error) {
      logger.error("Error confirming Payway payment", {
        orderId: verificationResult.orderId,
        transactionId: data.transactionId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      // Retornar éxito en la verificación pero indicar que la confirmación falló
      return successResponse({
        verified: true,
        status: verificationResult.status,
        orderId: verificationResult.orderId,
        message: "Pago verificado pero hubo un error al confirmarlo. El webhook lo procesará.",
        warning: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  // Si el pago está pendiente o fue rechazado, solo actualizar el estado del pago
  const existingPayment = order.payments[0];
  if (existingPayment) {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: verificationResult.status === "pending" ? "PENDING" : "FAILED",
        rawResponse: {
          ...(existingPayment.rawResponse as Record<string, unknown> || {}),
          verificationStatus: verificationResult.status,
          verificationMessage: verificationResult.message,
          verified: true,
          verifiedAt: new Date().toISOString(),
        },
      },
    });
  }

  return successResponse({
    verified: true,
    status: verificationResult.status,
    orderId: verificationResult.orderId || data.orderId,
    message: verificationResult.message || "Pago verificado pero no confirmado",
  });
}));
