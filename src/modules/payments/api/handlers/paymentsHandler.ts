/**
 * HTTP Handlers para Payments
 * Maneja requests HTTP y delega a controllers
 */

import { NextRequest } from "next/server";
import { PaymentsController } from "../controllers/paymentsController";
import { successResponse, createdResponse } from "@/lib/api/response";
import { withErrorHandler } from "@/lib/api/errorHandler";

const controller = new PaymentsController();

export const paymentsHandler = {
  /**
   * GET /api/payments/:id - Obtener payment por ID
   */
  getById: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const payment = await controller.getById(id);
    return successResponse(payment);
  }),

  /**
   * GET /api/payments/order/:orderId - Obtener payments de una orden
   */
  getByOrderId: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) => {
    const { orderId } = await params;
    const payments = await controller.getByOrderId(orderId);
    return successResponse(payments);
  }),

  /**
   * POST /api/payments - Crear registro de pago (admin)
   */
  create: withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const payment = await controller.create(body);
    return createdResponse(payment);
  }),

  /**
   * POST /api/payments/webhook/paypal - Webhook PayPal
   */
  paypalWebhook: withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const result = await controller.processPayPalWebhook(body);
    return successResponse(result);
  }),

  /**
   * POST /api/payments/webhook/payway - Webhook Payway
   */
  paywayWebhook: withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const result = await controller.processPaywayWebhook(body);
    return successResponse(result);
  }),
};

