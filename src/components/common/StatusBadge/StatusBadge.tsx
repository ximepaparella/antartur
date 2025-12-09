import type { StatusBadgeProps } from "./types";
import { statusLabels, statusVariants } from "./types";
import styles from "./StatusBadge.module.scss";

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const label = statusLabels[status] || status;
  const variant = statusVariants[status] || "default";

  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`.trim()}>
      {label}
    </span>
  );
}

