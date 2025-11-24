/**
 * Hook para determinar el estado de una celda de fecha en el calendario
 */

import { useMemo } from "react";
import { formatDate, isDateDisabled } from "../utils/dateUtils";
import type { GroupedAvailability } from "./useCalendarState";

interface UseDateCellStateProps {
  date: Date;
  groupedAvailability: Map<string, GroupedAvailability>;
  selectedDate: string | null;
}

interface DateCellState {
  dateStr: string;
  isDisabled: boolean;
  isAvailable: boolean;
  isSelected: boolean;
  availability: GroupedAvailability | undefined;
  totalAvailable: number;
  canClick: boolean;
}

/**
 * Hook que determina el estado completo de una celda de fecha
 */
export function useDateCellState({
  date,
  groupedAvailability,
  selectedDate,
}: UseDateCellStateProps): DateCellState {
  return useMemo(() => {
    const dateStr = formatDate(date);
    
    // 1. Verificar si la fecha está en el pasado
    const isPast = isDateDisabled(date);
    
    // 2. Obtener disponibilidad de la fecha
    const availability = groupedAvailability.get(dateStr);
    
    // 3. Calcular disponibilidad total
    const totalAvailable = availability?.totalAvailable || 0;
    
    // 4. Una fecha está disponible solo si:
    //    - No está en el pasado
    //    - Tiene disponibilidad > 0
    const isAvailable = !isPast && totalAvailable > 0;
    
    // 5. Una fecha está deshabilitada si:
    //    - Está en el pasado O
    //    - No tiene disponibilidad (disponibilidad = 0 o no existe)
    const isDisabled = isPast || totalAvailable === 0;
    
    // 6. Verificar si está seleccionada
    const isSelected = selectedDate === dateStr;
    
    // 7. Se puede hacer click solo si está disponible
    const canClick = isAvailable;

    return {
      dateStr,
      isDisabled,
      isAvailable,
      isSelected,
      availability,
      totalAvailable,
      canClick,
    };
  }, [date, groupedAvailability, selectedDate]);
}

