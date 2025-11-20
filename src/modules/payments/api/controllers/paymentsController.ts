/**
 * Controller para Payments
 * Maneja la lógica de validación, transformación y llamadas a servicios
 */

import { PaymentRepository } from "../../infra/paymentRepository";
import { OrderRepository } from "../../../orders/infra/orderRepository";
import { confirmPayment } from "../../../orders/domain/orderService";
import { validateBody } from "@/lib/validation/schemas";
import {
  createPaymentSchema,
  paypalWebhookSchema,
  paywayWebhookSchema,
  type CreatePaymentInput,
  type PayPalWebhookInput,
  type PaywayWebhookInput,
} from "../validators/paymentsValidators";
import { toPaymentResponse } from "../dto/paymentsDto";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { prisma } from "@/lib/db";

const paymentRepository = new PaymentRepository();
const orderRepository = new OrderRepository();

export class PaymentsController {
  /**
   * Obtener payment por ID
   */
  async getById(id: string) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundError("Payment", id);
    }

    return toPaymentResponse(payment);
  }

  /**
   * Obtener payments de una orden
   */
  async getByOrderId(orderId: string) {
    // Verificar que la orden existe
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order", orderId);
    }

    const payments = await paymentRepository.findAll(orderId);
    return payments.map(toPaymentResponse);
  }

  /**
   * Crear registro de pago manual (admin)
   */
  async create(body: unknown) {
    const data = validateBody(createPaymentSchema, body);

    // Verificar que la orden existe
    const order = await orderRepository.findById(data.orderId);
    if (!order) {
      throw new NotFoundError("Order", data.orderId);
    }

    const payment = await paymentRepository.create({
      ...data,
      paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
    });

    return toPaymentResponse(payment);
  }

  /**
   * Procesar webhook de PayPal
   */
  async processPayPalWebhook(body: unknown) {
    const data = validateBody(paypalWebhookSchema, body);

    // TODO: Implementar lógica específica de PayPal
    // Por ahora, solo validar estructura básica
    if (data.event_type === "PAYMENT.SALE.COMPLETED") {
      const resource = data.resource as any;
      const orderId = resource.custom || resource.invoice_id;

      if (!orderId) {
        throw new ValidationError("Order ID not found in PayPal webhook");
      }

      // Confirmar pago usando el servicio de dominio
      await confirmPayment({
        orderId,
        provider: "PAYPAL",
        providerPaymentId: resource.id || resource.sale_id,
        amount: parseFloat(resource.amount?.total || resource.amount || "0"),
        currency: resource.amount?.currency || "USD",
        rawRequest: data as Record<string, unknown>,
        rawResponse: data.resource,
      });

      return { success: true, message: "Payment confirmed" };
    }

    return { success: true, message: "Webhook received but no action taken" };
  }

  /**
   * Procesar webhook de Payway
   */
  async processPaywayWebhook(body: unknown) {
    const data = validateBody(paywayWebhookSchema, body);

    // TODO: Implementar lógica específica de Payway
    if (data.status === "approved" || data.status === "completed") {
      const orderId = data.order_id;

      if (!orderId) {
        throw new ValidationError("Order ID not found in Payway webhook");
      }

      // Confirmar pago usando el servicio de dominio
      await confirmPayment({
        orderId,
        provider: "PAYWAY",
        providerPaymentId: data.payment_id,
        amount: data.amount,
        currency: data.currency,
        rawRequest: data as Record<string, unknown>,
        rawResponse: data.metadata,
      });

      return { success: true, message: "Payment confirmed" };
    }

    return { success: true, message: "Webhook received but no action taken" };
  }
}

