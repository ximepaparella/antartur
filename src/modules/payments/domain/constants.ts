/**
 * Constantes centralizadas para métodos de pago
 * Evita magic strings y duplicación de lógica
 */

/**
 * Métodos de pago soportados en el sistema
 */
export const PAYMENT_METHODS = ["transferencia", "paypal", "payway"] as const;
export type PaymentMethodType = (typeof PAYMENT_METHODS)[number];

/**
 * Métodos de pago por moneda (gateways online)
 * Nota: Esto es la configuración por defecto, los métodos reales
 * dependen de si el gateway está activo en la BD
 */
export const CURRENCY_GATEWAY_MAP: Record<string, PaymentMethodType[]> = {
  USD: ["paypal"],
  ARS: ["payway"],
};

/**
 * Métodos de pago que no requieren gateway y siempre están disponibles
 * (solo para monedas específicas)
 */
export const ALWAYS_AVAILABLE_METHODS: Record<string, PaymentMethodType[]> = {
  ARS: ["transferencia"],
};

/**
 * Verifica si un string es un método de pago válido
 */
export function isValidPaymentMethod(method: string): method is PaymentMethodType {
  return PAYMENT_METHODS.includes(method as PaymentMethodType);
}
