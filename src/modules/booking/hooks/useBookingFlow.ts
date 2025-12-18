/**
 * Hook para manejar el flujo de reserva
 */

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Pricing, TimeSlot, SelectedAdditional } from "@/lib/types/order";
import { calculateOrderTotal } from "@/lib/utils/pricing";
import { savePendingBooking } from "@/lib/utils/orderStorage";

interface TimeSlotWithAvailability extends TimeSlot {
  available: number;
}

interface UseBookingFlowProps {
  tourId: string;
  tourTitle: string;
  pricing?: Pricing | null;
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
  const [infants, setInfants] = useState(0);
  const [additionals, setAdditionals] = useState<SelectedAdditional[]>([]);

  // Calcular subtotal (infantes son $0, no afectan el total)
  const subtotal = useMemo(() => {
    if (!pricing) return 0;
    return calculateOrderTotal(adults, children, pricing, additionals);
  }, [adults, children, pricing, additionals]);

  // Verificar si excede disponibilidad (infantes NO descuentan cupo)
  const exceedsAvailability = useMemo(() => {
    if (!selectedDate || !selectedTimeSlot) return false;
    return adults + children > selectedTimeSlot.available;
  }, [selectedDate, selectedTimeSlot, adults, children]);

  // Manejar reserva
  const handleBooking = useCallback(() => {
    if (!selectedDate || !selectedTimeSlot || !pricing) return;

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
      infants,
      pricing,
      timeSlot: {
        start: selectedTimeSlot.start,
        end: selectedTimeSlot.end,
      },
      exceedsAvailability: false, // Usar el valor memoizado
      additionals: additionals.length > 0 ? additionals : undefined,
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
  }, [tourId, tourTitle, pricing, selectedDate, selectedTimeSlot, adults, children, infants, additionals, exceedsAvailability, router]);

  return {
    adults,
    children,
    infants,
    setAdults,
    setChildren,
    setInfants,
    additionals,
    setAdditionals,
    subtotal,
    exceedsAvailability,
    handleBooking,
  };
}

