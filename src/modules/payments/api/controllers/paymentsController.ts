/**
 * Controller para Payments
 * Solo orquesta: valida entrada, llama servicios, transforma salida
 */

import { PaymentService } from "../../domain/paymentService";
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

const paymentService = new PaymentService();

export class PaymentsController {
  /**
   * Obtener payment por ID
   */
  async getById(id: string) {
    const payment = await paymentService.getPaymentById(id);
    return toPaymentResponse(payment);
  }

  /**
   * Obtener payments de una orden
   */
  async getByOrderId(orderId: string) {
    const payments = await paymentService.getPaymentsByOrderId(orderId);
    return payments.map(toPaymentResponse);
  }

  /**
   * Crear registro de pago manual (admin)
   */
  async create(body: unknown) {
    const data = validateBody(createPaymentSchema, body);
    const payment = await paymentService.createPayment(data);
    return toPaymentResponse(payment);
  }

  /**
   * Procesar webhook de PayPal
   */
  async processPayPalWebhook(body: unknown) {
    const data = validateBody(paypalWebhookSchema, body);
    return await paymentService.processPayPalWebhook(data);
  }

  /**
   * Procesar webhook de Payway
   */
  async processPaywayWebhook(body: unknown) {
    const data = validateBody(paywayWebhookSchema, body);
    return await paymentService.processPaywayWebhook(data);
  }
}

