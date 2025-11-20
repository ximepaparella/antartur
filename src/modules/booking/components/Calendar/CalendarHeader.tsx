import React from "react";
import { Icon } from "@/components/icons/Icon";
import { MONTH_NAMES } from "../../utils/dateUtils";
import styles from "./Calendar.module.scss";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Componente CalendarHeader para mostrar el mes/año y navegación
 */
export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrev,
  onNext,
}) => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  return (
    <div className={styles.header}>
      <button
        type="button"
        onClick={onPrev}
        className={styles.navButton}
        aria-label="Mes anterior"
      >
        <Icon name="chevron-left" size={20} aria-hidden="true" />
      </button>
      <h2 className={styles.monthYear}>
        {MONTH_NAMES[currentMonth]} {currentYear}
      </h2>
      <button
        type="button"
        onClick={onNext}
        className={styles.navButton}
        aria-label="Mes siguiente"
      >
        <Icon name="chevron-right" size={20} aria-hidden="true" />
      </button>
    </div>
  );
};

