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

    // Mensajes informativos (siempre visibles)
    if (restrictionText) {
      messages.push({
        id: "restriction",
        variant: "info",
        content: restrictionText,
      });
    }

    if (minAge) {
      messages.push({
        id: "minAge",
        variant: "info",
        content: `Edad mínima requerida: ${minAge} años`,
      });
    }

    if (minPassengers) {
      messages.push({
        id: "minPassengers",
        variant: "info",
        content: `Mínimo de pasajeros requeridos: ${minPassengers}`,
      });
    }

    // Mensajes de validación (solo si hay error)
    if (minPassengers && totalPassengers < minPassengers) {
      messages.push({
        id: "violatesMinPassengers",
        variant: "warning",
        content: `Este tour requiere un mínimo de ${minPassengers} pasajero${minPassengers > 1 ? "s" : ""}`,
      });
    }

    if (exceedsAvailability) {
      messages.push({
        id: "exceedsAvailability",
        variant: "warning",
        content: "La cantidad de pasajeros supera la disponibilidad. Puede continuar y enviar una consulta de disponibilidad a nuestro equipo.",
      });
    }

    return messages;
  }, [restrictionText, minAge, minPassengers, totalPassengers, exceedsAvailability]);
}

