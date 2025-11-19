import React from "react";
import { DateCell } from "./DateCell";
import { formatDate, isDateDisabled } from "../../utils/dateUtils";
import type { GroupedAvailability } from "../../hooks/useCalendarState";
import styles from "./Calendar.module.scss";

interface CalendarGridProps {
  calendarDays: Array<{ date: Date; isCurrentMonth: boolean }>;
  selectedDate: string | null;
  groupedAvailability: Map<string, GroupedAvailability>;
  hoveredDate: string | null;
  onDateClick: (date: Date) => void;
  onMouseEnter: (dateStr: string) => void;
  onMouseLeave: () => void;
}

/**
 * Componente CalendarGrid para renderizar la grilla de días del calendario
 * Memoizado para prevenir re-renders cuando cambian los controles de reserva
 */
export const CalendarGrid: React.FC<CalendarGridProps> = React.memo(({
  calendarDays,
  selectedDate,
  groupedAvailability,
  hoveredDate,
  onDateClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div className={styles.daysGrid}>
      {calendarDays.map(({ date, isCurrentMonth }, index) => {
        const dateStr = formatDate(date);
        const isDisabled = isDateDisabled(date);
        const isAvailable = groupedAvailability.has(dateStr);
        const isSelected = selectedDate === dateStr;
        const availability = groupedAvailability.get(dateStr);

        return (
          <DateCell
            key={`${dateStr}-${index}`}
            date={date}
            isCurrentMonth={isCurrentMonth}
            isSelected={isSelected}
            isDisabled={isDisabled}
            isAvailable={isAvailable}
            availability={availability}
            hoveredDate={hoveredDate}
            onClick={onDateClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        );
      })}
    </div>
  );
});

CalendarGrid.displayName = "CalendarGrid";

