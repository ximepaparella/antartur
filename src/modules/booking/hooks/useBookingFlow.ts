/**
 * Hook para manejar el flujo de reserva
 */

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Pricing, TimeSlot } from "@/lib/types/order";
import { calculateOrderTotal } from "@/lib/utils/pricing";
import { savePendingBooking } from "@/lib/utils/orderStorage";

interface TimeSlotWithAvailability extends TimeSlot {
  available: number;
}

interface UseBookingFlowProps {
  tourId: string;
  tourTitle: string;
  pricing: Pricing;
  selectedDate: string | null;
  selectedTimeSlot: TimeSlotWithAvailability | null;
}

export function useBookingFlow({
  tourId,
  tourTitle,
  pricing,
  selectedDate,
  selectedTimeSlot,
}: UseBookingFlowProps) {
  const router = useRouter();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  // Calcular subtotal
  const subtotal = useMemo(() => {
    return calculateOrderTotal(adults, children, pricing);
  }, [adults, children, pricing]);

  // Verificar si excede disponibilidad
  const exceedsAvailability = useMemo(() => {
    if (!selectedDate || !selectedTimeSlot) return false;
    return adults + children > selectedTimeSlot.available;
  }, [selectedDate, selectedTimeSlot, adults, children]);

  // Manejar reserva
  const handleBooking = useCallback(() => {
    if (!selectedDate || !selectedTimeSlot) return;

    // Usar el valor memoizado de exceedsAvailability en lugar de recalcular
    if (exceedsAvailability) {
      console.error("La reserva excede la disponibilidad disponible");
      // TODO: Mostrar notificación al usuario cuando se implemente sistema de notificaciones
      return;
    }

    // Crear objeto de reserva inicial
    const bookingData = {
      tourId,
      tourTitle,
      date: selectedDate,
      adults,
      children,
      pricing,
      timeSlot: {
        start: selectedTimeSlot.start,
        end: selectedTimeSlot.end,
      },
      exceedsAvailability: false, // Usar el valor memoizado
    };

    // Guardar en localStorage
    try {
      savePendingBooking(bookingData);
    } catch (error) {
      console.error("Error al guardar datos de reserva:", error);
      // TODO: Mostrar notificación de error al usuario cuando se implemente sistema de notificaciones
      // Por ahora, lanzar el error para que el componente pueda manejarlo
      throw new Error("No se pudo guardar la reserva. Por favor, intenta nuevamente.");
    }

    // Redirigir a checkout
    router.push("/checkout");
  }, [tourId, tourTitle, pricing, selectedDate, selectedTimeSlot, adults, children, exceedsAvailability, router]);

  return {
    adults,
    children,
    setAdults,
    setChildren,
    subtotal,
    exceedsAvailability,
    handleBooking,
  };
}

