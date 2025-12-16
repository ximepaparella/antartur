/**
 * Utilidades para métodos de pago
 * Solo contiene helpers de UI (iconos, descripciones)
 * La lógica de métodos disponibles está en useAvailablePaymentMethods hook
 */

import type { PaymentMethod } from "@/lib/types/order";

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

