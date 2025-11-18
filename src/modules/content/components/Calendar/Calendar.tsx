"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons/Icon";
import { Tooltip } from "@/components/common/Tooltip";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input";
import { Message } from "@/components/common/Message";
import { Modal } from "@/components/common/Modal";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPrice, getPriceByCurrency } from "@/lib/utils/priceFormat";
import type { Pricing, TimeSlot } from "@/lib/types/order";
import styles from "./Calendar.module.scss";

// Extensión del TimeSlot compartido para incluir disponibilidad (uso interno del componente)
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
  totalAvailable: number; // Máximo disponible entre todos los horarios (para mostrar en tooltip)
}

interface CalendarProps {
  /** ID del tour */
  tourId: string;
  /** Título del tour */
  tourTitle: string;
  /** Fechas con disponibilidad */
  availability: AvailabilityDate[];
  /** Precios del tour */
  pricing: Pricing;
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
}) => {
  const router = useRouter();
  const { currency } = useCurrency();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotWithAvailability | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

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

  // Obtener días del mes
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Convertir de Sunday-first (0-6) a Monday-first (0-6) donde Monday=0, Sunday=6
  const firstDayOfMonth = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Nombres de meses y días
  const monthNames = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
  ];
  const dayNames = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

  // Navegación de meses
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Verificar si una fecha está disponible
  const isDateAvailable = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;

    const dateStr = formatDate(date);
    return groupedAvailabilityMap.has(dateStr);
  };

  // Verificar si una fecha está deshabilitada
  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Formatear fecha a YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Formatear fecha para mostrar
  const formatDisplayDate = (dateStr: string): string => {
    // Parsear como fecha local para evitar problemas de timezone
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  // Manejar click en fecha
  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    if (!isDateAvailable(date)) return;

    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    
    // Si hay múltiples horarios, seleccionar el primero por defecto
    const grouped = groupedAvailabilityMap.get(dateStr);
    if (grouped && grouped.timeSlots.length > 0) {
      setSelectedTimeSlot(grouped.timeSlots[0]);
    } else {
      setSelectedTimeSlot(null);
    }
  };

  // Calcular subtotal
  const subtotal = useMemo(() => {
    return adults * pricing.priceAdult + children * pricing.priceChild;
  }, [adults, children, pricing]);

  // Verificar si excede disponibilidad
  const exceedsAvailability = useMemo(() => {
    if (!selectedDate || !selectedTimeSlot) return false;
    return adults + children > selectedTimeSlot.available;
  }, [selectedDate, selectedTimeSlot, adults, children]);

  // Manejar reserva
  const handleBooking = () => {
    if (!selectedDate || !selectedTimeSlot) return;

    // Obtener precios según la moneda seleccionada
    const prices = getPriceByCurrency(pricing, currency);
    const currentPricing: Pricing = {
      ...pricing,
      currency,
      priceAdult: prices.priceAdult,
      priceChild: prices.priceChild,
    };

    // Crear objeto de reserva inicial
    const bookingData = {
      tourId,
      tourTitle,
      date: selectedDate,
      adults,
      children,
      pricing: currentPricing,
      timeSlot: {
        start: selectedTimeSlot.start,
        end: selectedTimeSlot.end,
      },
      exceedsAvailability: adults + children > selectedTimeSlot.available,
    };

    // Guardar en localStorage
    try {
      localStorage.setItem("pendingBooking", JSON.stringify(bookingData));
    } catch (error) {
      console.error("Error al guardar datos de reserva:", error);
    }

    // Redirigir a checkout (todos los datos están en localStorage)
    router.push("/checkout");
  };

  // Generar días del calendario
  const calendarDays: Array<{ date: Date; isCurrentMonth: boolean }> = [];

  // Días del mes anterior
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1, lastDayOfPrevMonth - i);
    calendarDays.push({ date, isCurrentMonth: false });
  }

  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    calendarDays.push({ date, isCurrentMonth: true });
  }

  // Días del mes siguiente para completar la grilla
  const remainingDays = 42 - calendarDays.length; // 6 semanas * 7 días
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(currentYear, currentMonth + 1, day);
    calendarDays.push({ date, isCurrentMonth: false });
  }

  const selectedGrouped = selectedDate ? groupedAvailabilityMap.get(selectedDate) : null;
  const hasMultipleTimeSlots = selectedGrouped ? selectedGrouped.timeSlots.length > 1 : false;

  return (
    <>
      <div className={styles.calendar}>
        <div className={styles.header}>
          <button
            type="button"
            onClick={goToPreviousMonth}
            className={styles.navButton}
            aria-label="Mes anterior"
          >
            <Icon name="chevron-left" size={20} />
          </button>
          <h2 className={styles.monthYear}>
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button
            type="button"
            onClick={goToNextMonth}
            className={styles.navButton}
            aria-label="Mes siguiente"
          >
            <Icon name="chevron-right" size={20} />
          </button>
        </div>

        <div className={styles.daysOfWeek}>
          {dayNames.map((day) => (
            <div key={day} className={styles.dayName}>
              {day}
            </div>
          ))}
        </div>

        <div className={styles.daysGrid}>
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const dateStr = formatDate(date);
            const isDisabled = isDateDisabled(date);
            const isAvailable = isDateAvailable(date);
            const isSelected = selectedDate === dateStr;
            const grouped = groupedAvailabilityMap.get(dateStr);
            const totalAvailable = grouped?.totalAvailable || 0;
            const isHovered = hoveredDate === dateStr;

            return (
              <div
                key={`${dateStr}-${index}`}
                className={`${styles.dayCell} ${
                  !isCurrentMonth ? styles.otherMonth : ""
                } ${isDisabled ? styles.disabled : ""} ${
                  isAvailable ? styles.available : ""
                } ${isSelected ? styles.selected : ""}`}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => isAvailable && setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <span className={styles.dayNumber}>{date.getDate()}</span>
                {isHovered && grouped && (
                  <Tooltip position="top">
                    {totalAvailable} Disponibles{grouped.timeSlots.length > 1 ? ` (${grouped.timeSlots.length} horarios)` : ""}
                  </Tooltip>
                )}
              </div>
            );
          })}
        </div>

        {selectedDate && selectedGrouped && selectedTimeSlot && (
          <div className={styles.selectedDateInfo}>
            <p className={styles.selectedDateText}>
              {formatDisplayDate(selectedDate)}
            </p>
            
            <div className={styles.timeSlotsSelection}>
              {hasMultipleTimeSlots && (
                <p className={styles.timeSlotsLabel}>Seleccioná el horario:</p>
              )}
              <div className={styles.timeSlotsRadioGroup}>
                {selectedGrouped.timeSlots.map((slot, index) => (
                  <label
                    key={`${slot.start}-${slot.end}`}
                    className={`${styles.timeSlotRadio} ${
                      selectedTimeSlot.start === slot.start && selectedTimeSlot.end === slot.end
                        ? styles.timeSlotRadioSelected
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`timeSlot-${selectedDate}`}
                      value={`${slot.start}-${slot.end}`}
                      checked={
                        selectedTimeSlot.start === slot.start && selectedTimeSlot.end === slot.end
                      }
                      onChange={() => setSelectedTimeSlot(slot)}
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
            
            <Button
              variant="tertiary"
              onClick={() => setShowModal(true)}
              disabled={!selectedTimeSlot}
            >
              Reservar
            </Button>
          </div>
        )}
      </div>

      {showModal && selectedDate && selectedTimeSlot && (
        <BookingModal
          tourTitle={tourTitle}
          date={formatDisplayDate(selectedDate)}
          timeSlot={`${selectedTimeSlot.start} – ${selectedTimeSlot.end}`}
          pricing={pricing}
          adults={adults}
          childrenCount={children}
          onAdultsChange={setAdults}
          onChildrenChange={setChildren}
          onClose={() => {
            setIsClosingModal(true);
            setTimeout(() => {
              setShowModal(false);
              setIsClosingModal(false);
            }, 200);
          }}
          onBooking={handleBooking}
          exceedsAvailability={exceedsAvailability}
          isClosing={isClosingModal}
        />
      )}
    </>
  );
};

interface BookingModalProps {
  tourTitle: string;
  date: string;
  timeSlot: string;
  pricing: Pricing;
  adults: number;
  childrenCount: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  onClose: () => void;
  onBooking: () => void;
  exceedsAvailability: boolean;
  isClosing?: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({
  tourTitle,
  date,
  timeSlot,
  pricing,
  adults,
  childrenCount,
  onAdultsChange,
  onChildrenChange,
  onClose,
  onBooking,
  exceedsAvailability,
  isClosing = false,
}) => {
  const { currency } = useCurrency();
  const prices = getPriceByCurrency(pricing, currency);
  const subtotal = adults * prices.priceAdult + childrenCount * prices.priceChild;

  return (
    <Modal
      isOpen={true}
      isClosing={isClosing}
      title="REALIZAR UNA RESERVA"
      size="medium"
      onClose={onClose}
    >
      <div className={styles.modalReservationInfo}>
        <p className={styles.modalActivity}>{tourTitle}</p>
        <p className={styles.modalDateTime}>
          <Icon name="calendar-days" size={20} className={styles.modalIcon} />
          {date} a {timeSlot}
        </p>
      </div>

      {exceedsAvailability && (
        <Message variant="warning">
          <p>
            La cantidad de pasajeros supera la disponibilidad. Puede continuar y enviar una consulta de disponibilidad a nuestro equipo.
          </p>
        </Message>
      )}

      <div className={styles.passengersRow}>
        <div className={styles.passengerInput}>
          <Input
            label="Pasajeros Adultos"
            name="adults"
            type="number"
            min="1"
            max="10"
            required
            value={adults.toString()}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 1 && value <= 10) {
                onAdultsChange(value);
              }
            }}
          />
        </div>
        <div className={styles.passengerInput}>
          <Input
            label="Pasajeros Menores (0-11 años)"
            name="children"
            type="number"
            min="0"
            max="11"
            value={childrenCount.toString()}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0 && value <= 11) {
                onChildrenChange(value);
              }
            }}
          />
          <p className={styles.helperText}>Máximo 11 pasajeros menores</p>
        </div>
      </div>

      <div className={styles.disclaimer}>
        <Icon name="info" size={16} />
        <p>La información de los pasajeros se solicitará en el siguiente paso.</p>
      </div>

      <div className={styles.subtotalSection}>
        <p className={styles.subtotalLabel}>Subtotal:</p>
        <p className={styles.subtotalAmount}>{formatPrice(subtotal, currency)}</p>
      </div>

      <div className={styles.modalActions}>
        <Button
          variant="primary"
          onClick={onBooking}
        >
          Realizar una reserva
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancelar Reserva
        </Button>
      </div>
    </Modal>
  );
};

