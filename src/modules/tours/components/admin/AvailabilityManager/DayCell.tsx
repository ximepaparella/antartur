"use client";

import { Users, Trash2 } from "lucide-react";
import type { Departure } from "@/modules/tours/types/admin";
import { formatArDate } from "@/lib/utils/dateTimeAr";
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

  const getCellClassName = (includeDisabled = false) => {
    return `
      ${styles.dayCell}
      ${!isCurrentMonth ? styles.otherMonth : ""}
      ${isToday ? styles.today : ""}
      ${isPast ? styles.past : ""}
      ${isSelected ? styles.selected : ""}
      ${getStatusClass()}
      ${includeDisabled && isDisabled ? styles.disabled : ""}
    `.trim();
  };

  const getTitleText = () => {
    if (isWeekdayDisabled) {
      return "Este día no está disponible para este tour";
    }
    if (departure) {
      return `${seatsAvailable} cupos disponibles`;
    }
    return "Click para agregar disponibilidad (Ctrl/Cmd para selección múltiple)";
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
      if (confirm(`¿Eliminar disponibilidad del ${formatArDate(date)}?`)) {
        onDelete(departure.id);
      }
    }
  };

  const isDisabled = disabled || isPast || isWeekdayDisabled;

  const dayCellContent = (
    <>
      <span className={styles.dayNumber}>{dayNumber}</span>
      
      {departure && (
        <div className={styles.departureInfo}>
          <div className={styles.seats}>
            <Users size={14} />
            <span>{seatsAvailable}/{departure.seatsTotal}</span>
          </div>
        </div>
      )}

      {!departure && isCurrentMonth && !isPast && !isWeekdayDisabled && (
        <div className={styles.addHint}>+</div>
      )}
    </>
  );

  const titleText = getTitleText();
  const cellClassName = getCellClassName();

  // Si hay un botón de eliminar, usar un div contenedor para evitar botones anidados
  if (departure && onDelete) {
    return (
      <div
        className={getCellClassName(true)}
        title={titleText}
      >
        <button
          type="button"
          className={styles.dayCellButton}
          onClick={handleClick}
          disabled={isDisabled}
          title={titleText}
        >
          {dayCellContent}
        </button>
        <button
          type="button"
          className={`${styles.deleteButton} ${styles.deleteButtonAlwaysVisible}`}
          onClick={handleDelete}
          title="Eliminar disponibilidad"
        >
          <Trash2 size={12} />
        </button>
      </div>
    );
  }

  // Si no hay botón de eliminar, usar el botón directamente
  return (
    <button
      type="button"
      className={cellClassName}
      onClick={handleClick}
      disabled={isDisabled}
      title={titleText}
    >
      {dayCellContent}
    </button>
  );
}

