import React from "react";
import { Tooltip } from "@/components/common/Tooltip";
import { formatArDate } from "@/lib/utils/dateTimeAr";
import type { GroupedAvailability } from "../../hooks/useCalendarState";
import { useDateCellState } from "../../hooks/useDateCellState";
import styles from "./Calendar.module.scss";

interface DateCellProps {
  date: Date;
  isCurrentMonth: boolean;
  groupedAvailability: Map<string, GroupedAvailability>;
  selectedDate: string | null;
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
  groupedAvailability,
  selectedDate,
  hoveredDate,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const cellState = useDateCellState({
    date,
    groupedAvailability,
    selectedDate,
  });

  const isHovered = hoveredDate === cellState.dateStr;
  const showTooltip = isHovered && cellState.isAvailable && cellState.availability;

  const handleClick = () => {
    if (cellState.canClick) {
      onClick(date);
    }
  };

  const handleMouseEnter = () => {
    // Permitir hover en todas las fechas para mostrar información
    onMouseEnter(cellState.dateStr);
  };

  return (
    <button
      type="button"
      className={`${styles.dayCell} ${
        !isCurrentMonth ? styles.otherMonth : ""
      } ${cellState.isDisabled ? styles.disabled : ""} ${
        cellState.isAvailable ? styles.available : ""
      } ${cellState.isSelected ? styles.selected : ""}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={cellState.isDisabled}
      aria-label={`${date.getDate()} de ${formatArDate(date, { month: "long", year: "numeric" })}${cellState.isAvailable ? `, ${cellState.totalAvailable} disponibles` : ", no disponible"}`}
      aria-pressed={cellState.isSelected}
    >
      <span className={styles.dayNumber}>{date.getDate()}</span>
      {showTooltip && cellState.availability && (
        <Tooltip position="top">
          {cellState.totalAvailable} cupo{cellState.totalAvailable !== 1 ? 's' : ''} disponible{cellState.totalAvailable !== 1 ? 's' : ''}
          {cellState.availability.timeSlots.length > 1 ? ` (${cellState.availability.timeSlots.length} horarios)` : ""}
        </Tooltip>
      )}
    </button>
  );
});

DateCell.displayName = "DateCell";

