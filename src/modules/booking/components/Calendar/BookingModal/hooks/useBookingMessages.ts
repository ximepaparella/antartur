/**
 * Hook para manejar mensajes informativos y de validación en BookingModal
 */

import { useMemo } from "react";

interface UseBookingMessagesProps {
  restrictionText?: string | null;
  minAge?: number | null;
  minPassengers?: number | null;
  totalPassengers: number;
  exceedsAvailability?: boolean;
}

import type { MessageVariant } from "@/components/common/Message";

interface BookingMessage {
  id: string;
  variant: MessageVariant;
  content: string;
}

/**
 * Hook que agrupa todos los mensajes del modal de reserva
 */
export function useBookingMessages({
  restrictionText,
  minAge,
  minPassengers,
  totalPassengers,
  exceedsAvailability = false,
}: UseBookingMessagesProps): BookingMessage[] {
  return useMemo(() => {
    const messages: BookingMessage[] = [];

    // Restricciones en rojo
    if (restrictionText) {
      messages.push({
        id: "restriction",
        variant: "alert",
        content: restrictionText,
      });
    }

    // Advertencias: edad mínima y mínimo de pasajeros
    if (minAge) {
      messages.push({
        id: "minAge",
        variant: "warning",
        content: `Edad mínima requerida: ${minAge} años`,
      });
    }

    if (minPassengers) {
      messages.push({
        id: "minPassengers",
        variant: "warning",
        content: `Mínimo de pasajeros requeridos: ${minPassengers}`,
      });
    }

    // Si supera disponibilidad, solo un warning
    if (exceedsAvailability) {
      messages.push({
        id: "exceedsAvailability",
        variant: "warning",
        content: "La cantidad de pasajeros supera la disponibilidad. Puedes continuar y enviar una consulta a nuestro equipo.",
      });
    }

    // No repetir más mensajes
    return messages;
  }, [restrictionText, minAge, minPassengers, exceedsAvailability]);
}

