/**
 * Utilidades para métodos de pago
 */

import type { PaymentMethod } from "@/lib/types/order";

/**
 * Métodos de pago disponibles por defecto (ARS)
 */
export const AVAILABLE_PAYMENT_METHODS: PaymentMethod[] = ["transferencia", "payway"];

/**
 * Obtiene los métodos de pago disponibles según la moneda
 */
export function getAvailablePaymentMethods(currencyCode: string): PaymentMethod[] {
  if (currencyCode === "USD") {
    // Solo PayPal para USD
    return ["paypal"];
  } else {
    // Payway y Transferencia para ARS (y otras monedas)
    return ["payway", "transferencia"];
  }
}

/**
 * Obtiene el icono correspondiente a un método de pago
 */
export function getPaymentIcon(method: PaymentMethod): "bank" | "wallet" | "credit-card" {
  switch (method) {
    case "transferencia":
      return "bank";
    case "paypal":
      return "wallet";
    case "payway":
      return "credit-card";
    default:
      return "credit-card";
  }
}

/**
 * Obtiene la descripción/información de un método de pago
 */
export function getPaymentInfo(method: PaymentMethod): string {
  switch (method) {
    case "transferencia":
      return "Realiza tu pago directamente en nuestra cuenta bancaria. Por favor, usa el número del pedido como referencia de pago. Tu pedido no se procesará hasta que se haya recibido el importe en nuestra cuenta.";
    case "paypal":
      return "Pagar con PayPal; podés pagar con tu tarjeta de crédito si no tenés una cuenta de PayPal.";
    case "payway":
      return "Pago seguro a través de Payway.";
    default:
      return "";
  }
}

