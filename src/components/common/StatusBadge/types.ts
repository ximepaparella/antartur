export type OrderStatus = "PENDING_PAYMENT" | "PAID" | "CANCELLED" | "EXPIRED" | "COMPLETED";
export type BookingStatus = "HELD" | "CONFIRMED";
export type NotificationStatus = "PENDING" | "SENT" | "ERROR";

export type Status = OrderStatus | BookingStatus | NotificationStatus;

export interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export const statusLabels: Record<string, string> = {
  // Order Status
  PENDING_PAYMENT: "Pendiente",
  PAID: "Pagada",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
  COMPLETED: "Completada",
  // Booking Status
  HELD: "Reservada",
  CONFIRMED: "Confirmada",
  // Notification Status
  PENDING: "Pendiente",
  SENT: "Enviada",
  ERROR: "Error",
};

export const statusVariants: Record<string, string> = {
  // Order Status
  PENDING_PAYMENT: "warning",
  PAID: "success",
  CANCELLED: "error",
  EXPIRED: "error",
  COMPLETED: "success",
  // Booking Status
  HELD: "warning",
  CONFIRMED: "success",
  // Notification Status
  PENDING: "warning",
  SENT: "success",
  ERROR: "error",
};

