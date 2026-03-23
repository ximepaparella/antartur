/**
 * Hook para manejar el estado del calendario
 */

import { useState, useMemo, useEffect, useRef } from "react";
import type { TimeSlot } from "@/lib/types/order";
import {
  formatDate,
  generateCalendarDays,
  getInitialCalendarDateFromAvailability,
} from "../utils/dateUtils";

// Extensión del TimeSlot compartido para incluir disponibilidad
interface TimeSlotWithAvailability extends TimeSlot {
  available: number;
}

interface AvailabilityDate {
  date: string; // YYYY-MM-DD
  available: number;
  timeSlot: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
}

// Estructura agrupada por fecha con múltiples horarios
interface GroupedAvailability {
  date: string;
  timeSlots: TimeSlotWithAvailability[];
  totalAvailable: number; // Máximo disponible entre todos los horarios
}

interface UseCalendarStateProps {
  availability: AvailabilityDate[];
}

export function useCalendarState({ availability }: UseCalendarStateProps) {
  const [currentDate, setCurrentDate] = useState(() =>
    getInitialCalendarDateFromAvailability(availability)
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotWithAvailability | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const hasUserChangedMonth = useRef(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Agrupar disponibilidades por fecha (soporta múltiples horarios por fecha)
  const groupedAvailabilityMap = useMemo(() => {
    const map = new Map<string, GroupedAvailability>();
    
    availability.forEach((item) => {
      const existing = map.get(item.date);
      
      if (existing) {
        // Ya existe esta fecha, agregar el nuevo horario
        existing.timeSlots.push({
          start: item.timeSlot.start,
          end: item.timeSlot.end,
          available: item.available,
        });
        existing.totalAvailable = Math.max(existing.totalAvailable, item.available);
      } else {
        // Primera vez que vemos esta fecha
        map.set(item.date, {
          date: item.date,
          timeSlots: [{
            start: item.timeSlot.start,
            end: item.timeSlot.end,
            available: item.available,
          }],
          totalAvailable: item.available,
        });
      }
    });
    
    return map;
  }, [availability]);

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Navegación de meses
  const goToPreviousMonth = () => {
    hasUserChangedMonth.current = true;
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    hasUserChangedMonth.current = true;
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  useEffect(() => {
    if (hasUserChangedMonth.current || availability.length === 0) {
      return;
    }
    setCurrentDate(getInitialCalendarDateFromAvailability(availability));
  }, [availability]);

  // Manejar click en fecha
  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date);
    const grouped = groupedAvailabilityMap.get(dateStr);
    
    // Solo permitir seleccionar fechas con disponibilidad > 0
    if (grouped && grouped.totalAvailable > 0) {
      setSelectedDate(dateStr);
      
      // Si hay múltiples horarios, seleccionar el primero por defecto
      if (grouped.timeSlots.length > 0) {
        setSelectedTimeSlot(grouped.timeSlots[0]);
      } else {
        setSelectedTimeSlot(null);
      }
    }
  };

  return {
    // State
    currentDate,
    selectedDate,
    selectedTimeSlot,
    hoveredDate,
    
    // Computed
    currentYear,
    currentMonth,
    groupedAvailabilityMap,
    calendarDays,
    
    // Setters
    setCurrentDate,
    setSelectedDate,
    setSelectedTimeSlot,
    setHoveredDate,
    
    // Actions
    goToPreviousMonth,
    goToNextMonth,
    handleDateClick,
  };
}

export type { TimeSlotWithAvailability, GroupedAvailability, AvailabilityDate };

