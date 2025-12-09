"use client";

import { Clock, Users, Trash2 } from "lucide-react";
import type { Departure } from "@/modules/tours/types/admin";
import styles from "./DayCell.module.scss";

interface DayCellProps {
  date: Date;
  departure?: Departure;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  onSelect: (date: Date, departure?: Departure, event?: React.MouseEvent) => void;
  onDelete?: (departureId: string) => void;
  disabled?: boolean;
  isWeekdayDisabled?: boolean;
  isSelected?: boolean;
}

export function DayCell({
  date,
  departure,
  isCurrentMonth,
  isToday,
  isPast,
  onSelect,
  onDelete,
  disabled,
  isWeekdayDisabled = false,
  isSelected = false,
}: DayCellProps) {
  const dayNumber = date.getDate();
  const seatsAvailable = departure
    ? departure.seatsTotal - departure.seatsHeld - departure.seatsConfirmed
    : 0;

  const getStatusClass = () => {
    if (isWeekdayDisabled) return styles.disabledDay;
    if (!departure) return styles.empty;
    if (!departure.isActive) return styles.inactive;
    if (seatsAvailable <= 0) return styles.full;
    if (seatsAvailable <= 3) return styles.low;
    return styles.available;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || isPast || isWeekdayDisabled) return;
    // No abrir modal si se hace click en el botón de eliminar
    if ((e.target as HTMLElement).closest(`.${styles.deleteButton}`)) {
      return;
    }
    onSelect(date, departure, e);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (departure && onDelete) {
      if (confirm(`¿Eliminar disponibilidad del ${date.toLocaleDateString("es-AR")}?`)) {
        onDelete(departure.id);
      }
    }
  };

  const isDisabled = disabled || isPast || isWeekdayDisabled;

  return (
    <button
      type="button"
      className={`
        ${styles.dayCell}
        ${!isCurrentMonth ? styles.otherMonth : ""}
        ${isToday ? styles.today : ""}
        ${isPast ? styles.past : ""}
        ${isSelected ? styles.selected : ""}
        ${getStatusClass()}
      `}
      onClick={handleClick}
      disabled={isDisabled}
      title={
        isWeekdayDisabled
          ? "Este día no está disponible para este tour"
          : departure
          ? `${departure.startTime} - ${seatsAvailable} cupos disponibles`
          : "Click para agregar disponibilidad (Ctrl/Cmd para selección múltiple)"
      }
    >
      <span className={styles.dayNumber}>{dayNumber}</span>
      
      {departure && (
        <>
          <div className={styles.departureInfo}>
            <div className={styles.time}>
              <Clock size={12} />
              <span>{departure.startTime}</span>
            </div>
            <div className={styles.seats}>
              <Users size={12} />
              <span>{seatsAvailable}/{departure.seatsTotal}</span>
            </div>
          </div>
          {onDelete && (
            <button
              type="button"
              className={`${styles.deleteButton} ${styles.deleteButtonAlwaysVisible}`}
              onClick={handleDelete}
              title="Eliminar disponibilidad"
            >
              <Trash2 size={12} />
            </button>
          )}
        </>
      )}

      {!departure && isCurrentMonth && !isPast && !isWeekdayDisabled && (
        <div className={styles.addHint}>+</div>
      )}
    </button>
  );
}

