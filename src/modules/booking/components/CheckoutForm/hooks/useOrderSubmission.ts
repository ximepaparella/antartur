/**
 * Hook para manejar la creación y envío de órdenes
 * Preparado para integración con API en el futuro
 */

import { useState, useCallback } from "react";
import type { Order, PaymentMethod, Passenger, BillingInfo } from "@/lib/types/order";
import { generateOrderId, saveOrder, clearPendingBooking } from "@/lib/utils/orderStorage";
import type { BookingData } from "./useCheckoutInitialization";

interface OrderSubmissionData {
  bookingData: BookingData;
  passengers: Passenger[];
  billingInfo: BillingInfo;
  paymentMethod?: PaymentMethod;
  hasRestrictionViolations: boolean;
}

interface UseOrderSubmissionProps {
  onCheckoutComplete: (order: Order) => void;
  /** Función opcional para crear orden en API (por defecto usa localStorage) */
  createOrderAPI?: (order: Order) => Promise<Order>;
}

interface UseOrderSubmissionReturn {
  submitOrder: (data: OrderSubmissionData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * Hook para manejar la creación y envío de órdenes
 * 
 * Actualmente usa localStorage, pero está preparado para API:
 * - Pasar createOrderAPI para usar API en lugar de localStorage
 * - Maneja estados de loading y error
 * - Mantiene compatibilidad con localStorage para desarrollo
 */
export function useOrderSubmission({
  onCheckoutComplete,
  createOrderAPI,
}: UseOrderSubmissionProps): UseOrderSubmissionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitOrder = useCallback(
    async (data: OrderSubmissionData) => {
      const { bookingData, passengers, billingInfo, paymentMethod, hasRestrictionViolations } = data;

      setIsSubmitting(true);
      setError(null);

      try {
        // Determinar tipo de orden
        const orderType: "reserva" | "consulta" =
          bookingData.exceedsAvailability || hasRestrictionViolations ? "consulta" : "reserva";

        // Crear orden
        const order: Order = {
          orderId: generateOrderId(),
          tourId: bookingData.tourId,
          tourTitle: bookingData.tourTitle,
          date: bookingData.date,
          adults: bookingData.adults,
          children: bookingData.children,
          pricing: bookingData.pricing,
          timeSlot: bookingData.timeSlot,
          passengers,
          billingInfo,
          paymentMethod,
          orderType,
          exceedsAvailability: bookingData.exceedsAvailability,
          createdAt: new Date().toISOString(),
        };

        // Crear orden (API o localStorage)
        if (createOrderAPI) {
          // Usar API si está disponible
          const createdOrder = await createOrderAPI(order);
          clearPendingBooking();
          onCheckoutComplete(createdOrder);
        } else {
          // Usar localStorage (comportamiento actual)
          saveOrder(order);
          clearPendingBooking();
          onCheckoutComplete(order);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al crear la orden";
        setError(errorMessage);
        console.error("Error al crear la orden:", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onCheckoutComplete, createOrderAPI]
  );

  return {
    submitOrder,
    isSubmitting,
    error,
  };
}

