import React from "react";
import { DateCell } from "./DateCell";
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
      {calendarDays.map(({ date, isCurrentMonth }, index) => (
        <DateCell
          key={`${date.getTime()}-${index}`}
          date={date}
          isCurrentMonth={isCurrentMonth}
          groupedAvailability={groupedAvailability}
          selectedDate={selectedDate}
          hoveredDate={hoveredDate}
          onClick={onDateClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      ))}
    </div>
  );
});

CalendarGrid.displayName = "CalendarGrid";

