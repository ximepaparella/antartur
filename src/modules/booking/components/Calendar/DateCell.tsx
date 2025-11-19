import React from "react";
import { Tooltip } from "@/components/common/Tooltip";
import { formatDate } from "../../utils/dateUtils";
import type { GroupedAvailability } from "../../hooks/useCalendarState";
import styles from "./Calendar.module.scss";

interface DateCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isAvailable: boolean;
  availability: GroupedAvailability | undefined;
  hoveredDate: string | null;
  onClick: (date: Date) => void;
  onMouseEnter: (dateStr: string) => void;
  onMouseLeave: () => void;
}

/**
 * Componente DateCell para renderizar una celda individual del calendario
 * Memoizado para prevenir re-renders innecesarios
 */
export const DateCell: React.FC<DateCellProps> = React.memo(({
  date,
  isCurrentMonth,
  isSelected,
  isDisabled,
  isAvailable,
  availability,
  hoveredDate,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const dateStr = formatDate(date);
  const isHovered = hoveredDate === dateStr;
  const totalAvailable = availability?.totalAvailable || 0;

  return (
    <div
      className={`${styles.dayCell} ${
        !isCurrentMonth ? styles.otherMonth : ""
      } ${isDisabled ? styles.disabled : ""} ${
        isAvailable ? styles.available : ""
      } ${isSelected ? styles.selected : ""}`}
      onClick={() => onClick(date)}
      onMouseEnter={() => isAvailable && onMouseEnter(dateStr)}
      onMouseLeave={onMouseLeave}
    >
      <span className={styles.dayNumber}>{date.getDate()}</span>
      {isHovered && availability && (
        <Tooltip position="top">
          {totalAvailable} Disponibles{availability.timeSlots.length > 1 ? ` (${availability.timeSlots.length} horarios)` : ""}
        </Tooltip>
      )}
    </div>
  );
});

DateCell.displayName = "DateCell";

