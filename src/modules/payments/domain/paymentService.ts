/**
 * Servicio de dominio para Payments
 * Contiene la lógica de negocio para pagos
 */

import { PaymentRepository } from "../infra/paymentRepository";
import { OrderRepository } from "../../orders/infra/orderRepository";
import { confirmPayment } from "../../orders/domain/orderService";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import type { CreatePaymentInput, PayPalWebhookInput, PaywayWebhookInput } from "../api/validators/paymentsValidators";

const paymentRepository = new PaymentRepository();
const orderRepository = new OrderRepository();

export class PaymentService {
  /**
   * Obtener payment por ID
   */
  async getPaymentById(id: string) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundError("Payment", id);
    }
    return payment;
  }

  /**
   * Obtener payments de una orden
   */
  async getPaymentsByOrderId(orderId: string) {
    // Validación de negocio: verificar que la orden existe
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order", orderId);
    }

    const payments = await paymentRepository.findAll(orderId);
    return payments;
  }

  /**
   * Crear registro de pago manual (admin)
   */
  async createPayment(data: CreatePaymentInput) {
    // Validación de negocio: verificar que la orden existe
    const order = await orderRepository.findById(data.orderId);
    if (!order) {
      throw new NotFoundError("Order", data.orderId);
    }

    const payment = await paymentRepository.create({
      ...data,
      paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
    });

    return payment;
  }

  /**
   * Procesar webhook de PayPal
   */
  async processPayPalWebhook(data: PayPalWebhookInput) {
    // Lógica de negocio: procesar webhook de PayPal
    if (data.event_type === "PAYMENT.SALE.COMPLETED") {
      const resource = data.resource as Record<string, unknown>;
      const orderId = (resource.custom as string) || (resource.invoice_id as string);

      if (!orderId) {
        throw new ValidationError("Order ID not found in PayPal webhook");
      }

      // Confirmar pago usando el servicio de dominio de orders
      await confirmPayment({
        orderId,
        provider: "PAYPAL",
        providerPaymentId: (resource.id as string) || (resource.sale_id as string),
        amount: parseFloat((resource.amount as { total?: string })?.total || String(resource.amount || "0")),
        currency: ((resource.amount as { currency?: string })?.currency) || "USD",
        rawRequest: data as Record<string, unknown>,
        rawResponse: resource,
      });

      return { success: true, message: "Payment confirmed" };
    }

    return { success: true, message: "Webhook received but no action taken" };
  }

  /**
   * Procesar webhook de Payway
   */
  async processPaywayWebhook(data: PaywayWebhookInput) {
    // Lógica de negocio: procesar webhook de Payway
    if (data.status === "approved" || data.status === "completed") {
      const orderId = data.order_id;

      if (!orderId) {
        throw new ValidationError("Order ID not found in Payway webhook");
      }

      // Confirmar pago usando el servicio de dominio de orders
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

