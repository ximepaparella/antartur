import React from "react";
import { Icon } from "@/components/icons/Icon";
import styles from "./TourInfo.module.scss";

interface TourInfoProps {
  /** Título del tour */
  title: string;
  /** Fecha del tour */
  date: string;
  /** Horario del tour */
  timeSlot: string;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente TourInfo para mostrar información del tour
 * 
 * Muestra el título del tour, fecha y horario en un formato consistente.
 * 
 * @example
 * ```tsx
 * <TourInfo
 *   title="LAGOS OFF ROAD"
 *   date="19 noviembre, 2025"
 *   timeSlot="9:00 am – 4:30 pm"
 * />
 * ```
 */
export const TourInfo: React.FC<TourInfoProps> = ({
  title,
  date,
  timeSlot,
  className = "",
}) => {
  return (
    <div className={`${styles.tourInfo} ${className}`.trim()}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.dateTime}>
        <Icon name="calendar-days" size={16} className={styles.icon} />
        <span className={styles.text}>
          {date} a {timeSlot}
        </span>
      </div>
    </div>
  );
};

