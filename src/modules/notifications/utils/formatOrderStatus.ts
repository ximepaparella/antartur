import { ORDER_STATUS_LABELS } from "@/modules/orders/lib/orderStatusTransitions";

/**
 * Devuelve la etiqueta en español del estado de una orden para emails y UI.
 */
export function formatOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}
