import styles from "./StatusBadge.module.scss";

type OrderStatus = "PENDING_PAYMENT" | "PAID" | "CANCELLED" | "EXPIRED" | "COMPLETED";
type BookingStatus = "HELD" | "CONFIRMED" | "CANCELLED";
type NotificationStatus = "PENDING" | "SENT" | "ERROR";

type Status = OrderStatus | BookingStatus | NotificationStatus;

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusLabels: Record<Status, string> = {
  // Order Status
  PENDING_PAYMENT: "Pendiente",
  PAID: "Pagada",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
  COMPLETED: "Completada",
  // Booking Status
  HELD: "Reservada",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  // Notification Status
  PENDING: "Pendiente",
  SENT: "Enviada",
  ERROR: "Error",
};

const statusVariants: Record<Status, string> = {
  // Order Status
  PENDING_PAYMENT: "warning",
  PAID: "success",
  CANCELLED: "error",
  EXPIRED: "error",
  COMPLETED: "success",
  // Booking Status
  HELD: "warning",
  CONFIRMED: "success",
  CANCELLED: "error",
  // Notification Status
  PENDING: "warning",
  SENT: "success",
  ERROR: "error",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const label = statusLabels[status] || status;
  const variant = statusVariants[status] || "default";

  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`.trim()}>
      {label}
    </span>
  );
}

