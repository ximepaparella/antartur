import React from "react";
import type { TimeSlotWithAvailability } from "../../hooks/useCalendarState";
import styles from "./Calendar.module.scss";

interface TimeSlotSelectorProps {
  timeSlots: TimeSlotWithAvailability[];
  selectedTimeSlot: TimeSlotWithAvailability | null;
  selectedDate: string;
  onSelect: (timeSlot: TimeSlotWithAvailability) => void;
}

/**
 * Componente TimeSlotSelector para seleccionar un horario
 */
export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  timeSlots,
  selectedTimeSlot,
  selectedDate,
  onSelect,
}) => {
  const hasMultipleTimeSlots = timeSlots.length > 1;

  return (
    <div className={styles.timeSlotsSelection}>
      {hasMultipleTimeSlots && (
        <p className={styles.timeSlotsLabel}>Seleccioná el horario:</p>
      )}
      <div className={styles.timeSlotsRadioGroup}>
        {timeSlots.map((slot) => (
          <label
            key={`${slot.start}-${slot.end}`}
            className={`${styles.timeSlotRadio} ${
              selectedTimeSlot?.start === slot.start && selectedTimeSlot?.end === slot.end
                ? styles.timeSlotRadioSelected
                : ""
            }`}
          >
            <input
              type="radio"
              name={`timeSlot-${selectedDate}`}
              value={`${slot.start}-${slot.end}`}
              checked={
                selectedTimeSlot?.start === slot.start && selectedTimeSlot?.end === slot.end
              }
              onChange={() => onSelect(slot)}
              className={styles.radioInput}
            />
            <span className={styles.radioLabel}>
              {slot.start} – {slot.end}
              <span className={styles.radioAvailable}>
                ({slot.available} disponibles)
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

