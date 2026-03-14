/**
 * Reglas de transición de estado de orden para la UI.
 * Debe estar alineado con updateOrderStatus en orderService.
 * Este módulo no importa servicios ni DB para poder usarse en client components.
 */

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "CANCELLED",
  "EXPIRED",
  "COMPLETED",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

/**
 * Devuelve los estados a los que se puede transicionar desde el estado actual.
 */
export function getAllowedOrderStatusTransitions(
  currentStatus: string
): OrderStatusValue[] {
  if (currentStatus === "EXPIRED" || currentStatus === "CANCELLED" || currentStatus === "COMPLETED") {
    return [];
  }
  if (currentStatus === "PAID") {
    return ["COMPLETED", "CANCELLED"];
  }
  if (currentStatus === "PENDING_PAYMENT") {
    return ["PAID", "CANCELLED", "EXPIRED", "COMPLETED"];
  }
  return [];
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pendiente de pago",
  PAID: "Pagada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
};
