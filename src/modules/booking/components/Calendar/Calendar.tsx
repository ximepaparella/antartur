"use client";

import React, { useState } from "react";
import type { Pricing } from "@/lib/types/order";
import type { TourAdditional } from "@/modules/tours/types/tourTypes";
import { useCalendarState, type AvailabilityDate } from "../../hooks/useCalendarState";
import { useBookingFlow } from "../../hooks/useBookingFlow";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { SelectedDateInfo } from "./SelectedDateInfo";
import { BookingModal } from "./BookingModal/BookingModal";
import { formatDisplayDate } from "../../utils/dateUtils";
import { DAY_NAMES } from "../../utils/dateUtils";
import styles from "./Calendar.module.scss";

interface CalendarProps {
  /** ID del tour */
  tourId: string;
  /** Título del tour */
  tourTitle: string;
  /** Fechas con disponibilidad */
  availability: AvailabilityDate[];
  /** Precios del tour (opcional si no hay disponibilidad) */
  pricing?: Pricing | null;
  /** Additionals disponibles para el tour */
  additionals?: TourAdditional[];
  /** Edad mínima requerida */
  minAge?: number | null;
  /** Mínimo de pasajeros requeridos */
  minPassengers?: number | null;
  /** Si el tour acepta infantes (0-3 años) */
  allowsInfants?: boolean;
  /** Texto de restricciones del tour */
  restrictionText?: string | null;
}

/**
 * Componente Calendar para selección de fechas de reserva
 * 
 * Muestra un calendario con navegación entre meses, fechas habilitadas/deshabilitadas,
 * tooltips de disponibilidad y modal de reserva al hacer click en una fecha disponible.
 */
export const Calendar: React.FC<CalendarProps> = ({
  tourId,
  tourTitle,
  availability,
  pricing,
  additionals,
  minAge,
  minPassengers,
  allowsInfants,
  restrictionText,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);

  // Hooks para estado y lógica
  const calendarState = useCalendarState({ availability });
  const bookingFlow = useBookingFlow({
    tourId,
    tourTitle,
    pricing,
    selectedDate: calendarState.selectedDate,
    selectedTimeSlot: calendarState.selectedTimeSlot,
  });

  // Obtener información de la fecha seleccionada
  const selectedGrouped = calendarState.selectedDate
    ? calendarState.groupedAvailabilityMap.get(calendarState.selectedDate)
    : null;

  // Manejar cierre del modal
  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
    }, 200);
  };

  return (
    <>
      <div className={styles.calendar}>
        <CalendarHeader
          currentDate={calendarState.currentDate}
          onPrev={calendarState.goToPreviousMonth}
          onNext={calendarState.goToNextMonth}
        />

        <div className={styles.daysOfWeek}>
          {DAY_NAMES.map((day) => (
            <div key={day} className={styles.dayName}>
              {day}
            </div>
          ))}
        </div>

        <CalendarGrid
          calendarDays={calendarState.calendarDays}
          selectedDate={calendarState.selectedDate}
          groupedAvailability={calendarState.groupedAvailabilityMap}
          hoveredDate={calendarState.hoveredDate}
          onDateClick={calendarState.handleDateClick}
          onMouseEnter={calendarState.setHoveredDate}
          onMouseLeave={() => calendarState.setHoveredDate(null)}
        />

        {calendarState.selectedDate && selectedGrouped && calendarState.selectedTimeSlot && (
          <SelectedDateInfo
            selectedDate={calendarState.selectedDate}
            selectedTimeSlot={calendarState.selectedTimeSlot}
            groupedAvailability={selectedGrouped}
            onTimeSlotSelect={calendarState.setSelectedTimeSlot}
            onReserveClick={() => setShowModal(true)}
          />
        )}
      </div>

      {showModal && calendarState.selectedDate && calendarState.selectedTimeSlot && pricing && (
        <BookingModal
          tourTitle={tourTitle}
          date={formatDisplayDate(calendarState.selectedDate)}
          timeSlot={`${calendarState.selectedTimeSlot.start} – ${calendarState.selectedTimeSlot.end}`}
          pricing={pricing}
          adults={bookingFlow.adults}
          childrenCount={bookingFlow.children}
          infantsCount={bookingFlow.infants}
          onAdultsChange={bookingFlow.setAdults}
          onChildrenChange={bookingFlow.setChildren}
          onInfantsChange={bookingFlow.setInfants}
          onClose={handleCloseModal}
          onBooking={bookingFlow.handleBooking}
          exceedsAvailability={bookingFlow.exceedsAvailability}
          isClosing={isClosingModal}
          additionals={additionals}
          minAge={minAge}
          minPassengers={minPassengers}
          allowsInfants={allowsInfants}
          restrictionText={restrictionText}
          onAdditionalsChange={bookingFlow.setAdditionals}
        />
      )}
    </>
  );
};
