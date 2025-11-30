import { Icon } from "@/components/icons/Icon";
import styles from "./MetricCard.module.scss";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  trend,
  className = "",
}: MetricCardProps) {
  return (
    <div className={`${styles.metricCard} ${className}`.trim()}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {icon && (
          <div className={styles.icon}>
            <Icon name={icon as any} size={24} />
          </div>
        )}
      </div>
      <div className={styles.value}>{value}</div>
      {trend && (
        <div
          className={`${styles.trend} ${trend.positive ? styles.positive : styles.negative}`}
        >
          <span>{trend.value > 0 ? "+" : ""}{trend.value}%</span>
          <span className={styles.trendLabel}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}

