/**
 * @swagger
 * /api/payments/paypal/capture:
 *   post:
 *     summary: Capturar pago de PayPal después de aprobación del usuario
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paypalOrderId
 *               - orderId
 *             properties:
 *               paypalOrderId:
 *                 type: string
 *                 description: ID de la orden de PayPal (token)
 *               orderId:
 *                 type: string
 *                 description: ID de la orden en nuestro sistema
 *     responses:
 *       200:
 *         description: Pago capturado exitosamente
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { capturePayPalOrder } from "@/modules/payments/infra/paypalService";
import { confirmPayment } from "@/modules/orders/domain/orderService";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/services/logger";
import { ValidationError, NotFoundError } from "@/lib/api/errorHandler";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paypalOrderId, orderId } = body;

    if (!paypalOrderId) {
      return errorResponse("paypalOrderId es requerido", "MISSING_PAYPAL_ORDER_ID", 400);
    }

    if (!orderId) {
      return errorResponse("orderId es requerido", "MISSING_ORDER_ID", 400);
    }

    // Verificar que la orden existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError(`Order ${orderId} not found`);
    }

    // Capturar el pago en PayPal
    const captureResult = await capturePayPalOrder(paypalOrderId);

    if (!captureResult.success) {
      return errorResponse(
        "No se pudo capturar el pago de PayPal",
        "PAYPAL_CAPTURE_FAILED",
        400
      );
    }

    // Confirmar el pago en nuestra base de datos
    await confirmPayment({
      orderId,
      provider: "PAYPAL",
      providerPaymentId: captureResult.transactionId || paypalOrderId,
      amount: captureResult.amount || Number(order.totalAmount),
      currency: captureResult.currency || "USD",
      rawRequest: { paypalOrderId },
      rawResponse: captureResult,
    });

    logger.info("PayPal payment captured and confirmed", {
      orderId,
      paypalOrderId,
      transactionId: captureResult.transactionId,
    });

    return successResponse({
      success: true,
      message: "Payment captured successfully",
      transactionId: captureResult.transactionId,
    });
  } catch (error) {
    logger.error("Error in /api/payments/paypal/capture", error);
    
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return errorResponse(
        error.message,
        error.code || "VALIDATION_ERROR",
        400
      );
    }

    return errorResponse(
      error instanceof Error ? error.message : "Error al capturar el pago de PayPal",
      "PAYPAL_CAPTURE_ERROR",
      500
    );
  }
}

