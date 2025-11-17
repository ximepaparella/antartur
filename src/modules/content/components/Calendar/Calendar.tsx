"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons/Icon";
import { Tooltip } from "@/components/common/Tooltip";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input";
import { Message } from "@/components/common/Message";
import { Modal } from "@/components/common/Modal";
import styles from "./Calendar.module.scss";

interface AvailabilityDate {
  date: string; // YYYY-MM-DD
  available: number;
  timeSlot: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
}

interface Pricing {
  currency: "ARS" | "USD";
  priceAdult: number;
  priceChild: number;
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Crear mapa de disponibilidad por fecha
  const availabilityMap = useMemo(() => {
    const map = new Map<string, AvailabilityDate>();
    availability.forEach((item) => {
      map.set(item.date, item);
    });
    return map;
  }, [availability]);

  // Obtener días del mes
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
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
    return availabilityMap.has(dateStr);
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
    const date = new Date(dateStr);
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
    // No abrir modal automáticamente, solo seleccionar fecha
  };

  // Calcular subtotal
  const subtotal = useMemo(() => {
    return adults * pricing.priceAdult + children * pricing.priceChild;
  }, [adults, children, pricing]);

  // Verificar si excede disponibilidad
  const exceedsAvailability = useMemo(() => {
    if (!selectedDate) return false;
    const avail = availabilityMap.get(selectedDate);
    if (!avail) return false;
    return adults + children > avail.available;
  }, [selectedDate, adults, children, availabilityMap]);

  // Manejar reserva
  const handleBooking = () => {
    if (!selectedDate) return;
    
    const selectedAvailability = availabilityMap.get(selectedDate);
    if (!selectedAvailability) return;

    // Crear objeto de reserva inicial
    const bookingData = {
      tourId,
      tourTitle,
      date: selectedDate,
      adults,
      children,
      pricing,
      timeSlot: selectedAvailability.timeSlot,
      exceedsAvailability: adults + children > selectedAvailability.available,
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

  const selectedAvailability = selectedDate ? availabilityMap.get(selectedDate) : null;

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
            const avail = availabilityMap.get(dateStr);
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
                {isHovered && avail && (
                  <Tooltip position="top">
                    {avail.available} Disponibles
                  </Tooltip>
                )}
              </div>
            );
          })}
        </div>

        {selectedDate && selectedAvailability && (
          <div className={styles.selectedDateInfo}>
            <p className={styles.selectedDateText}>
              {formatDisplayDate(selectedDate)} a{" "}
              {selectedAvailability.timeSlot.start} – {selectedAvailability.timeSlot.end}
            </p>
            <Button
              variant="tertiary"
              onClick={() => setShowModal(true)}
            >
              Reservar
            </Button>
          </div>
        )}
      </div>

      {showModal && selectedDate && selectedAvailability && (
        <BookingModal
          tourTitle={tourTitle}
          date={formatDisplayDate(selectedDate)}
          timeSlot={`${selectedAvailability.timeSlot.start} – ${selectedAvailability.timeSlot.end}`}
          available={selectedAvailability.available}
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
  available: number;
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
  available,
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
  const subtotal = adults * pricing.priceAdult + childrenCount * pricing.priceChild;

  const formatPrice = (amount: number): string => {
    if (pricing.currency === "ARS") {
      return `$${amount.toLocaleString("es-AR")}`;
    }
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

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
        </div>
      </div>

      <div className={styles.disclaimer}>
        <Icon name="info" size={16} />
        <p>La información de los pasajeros se solicitará en el siguiente paso.</p>
      </div>

      <div className={styles.subtotalSection}>
        <p className={styles.subtotalLabel}>Subtotal:</p>
        <p className={styles.subtotalAmount}>{formatPrice(subtotal)}</p>
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

