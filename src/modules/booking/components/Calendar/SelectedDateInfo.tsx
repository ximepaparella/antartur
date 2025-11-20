import React from "react";
import { Button } from "@/components/common/Button/Button";
import { formatDisplayDate } from "../../utils/dateUtils";
import { TimeSlotSelector } from "./TimeSlotSelector";
import type { GroupedAvailability, TimeSlotWithAvailability } from "../../hooks/useCalendarState";
import styles from "./Calendar.module.scss";

interface SelectedDateInfoProps {
  selectedDate: string;
  selectedTimeSlot: TimeSlotWithAvailability | null;
  groupedAvailability: GroupedAvailability;
  onTimeSlotSelect: (timeSlot: TimeSlotWithAvailability) => void;
  onReserveClick: () => void;
}

/**
 * Componente SelectedDateInfo para mostrar información de la fecha seleccionada
 * y permitir seleccionar horario y reservar
 */
export const SelectedDateInfo: React.FC<SelectedDateInfoProps> = ({
  selectedDate,
  selectedTimeSlot,
  groupedAvailability,
  onTimeSlotSelect,
  onReserveClick,
}) => {
  return (
    <div className={styles.selectedDateInfo}>
      <p className={styles.selectedDateText}>
        {formatDisplayDate(selectedDate)}
      </p>
      
      <TimeSlotSelector
        timeSlots={groupedAvailability.timeSlots}
        selectedTimeSlot={selectedTimeSlot}
        selectedDate={selectedDate}
        onSelect={onTimeSlotSelect}
      />
      
      <Button
        variant="tertiary"
        onClick={onReserveClick}
        disabled={!selectedTimeSlot}
      >
        Reservar
      </Button>
    </div>
  );
};

