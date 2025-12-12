/**
 * Hook para manejar la creación y envío de órdenes
 * Preparado para integración con API en el futuro
 */

import { useState, useCallback } from "react";
import type { Order, PaymentMethod, Passenger, BillingInfo, Pricing, SelectedAdditional } from "@/lib/types/order";
import { generateOrderId, saveOrder, clearPendingBooking } from "@/lib/utils/orderStorage";
import { calculateAge, getPassengerPriceType } from "@/lib/utils/pricing";
import { createOrder, type CreateOrderRequest } from "@/modules/orders/api/client/ordersClient";
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
  /** Si usar API en lugar de localStorage (default: true en producción) */
  useAPI?: boolean;
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
  useAPI = true, // Siempre usar API para crear órdenes reales en BD
}: UseOrderSubmissionProps): UseOrderSubmissionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Convierte Passenger del frontend al formato del backend
   */
  const convertPassengerToAPI = useCallback((passenger: Passenger, pricing: Pricing): {
    type: "ADULT" | "CHILD" | "INFANT";
    firstName: string;
    lastName: string;
    birthDate?: string;
    documentType?: string;
    documentNumber?: string;
    nationality?: string;
    email?: string;
    phone?: string;
    restrictions?: Record<string, unknown>;
  } => {
    // Separar nombre completo en firstName y lastName
    const nameParts = passenger.nombreCompleto.trim().split(/\s+/).filter(part => part.length > 0);
    const firstName = nameParts[0] || "";
    // Si solo hay una palabra, usar "-" como lastName para cumplir con la validación
    // Si hay múltiples palabras, usar todas menos la primera como lastName
    const lastName = nameParts.length > 1 
      ? nameParts.slice(1).join(" ") 
      : "-";

    // Determinar tipo de pasajero basado en edad
    let passengerType: "ADULT" | "CHILD" | "INFANT" = "ADULT";
    if (passenger.fechaNacimiento) {
      const age = calculateAge(passenger.fechaNacimiento);
      const priceType = getPassengerPriceType(age, pricing);
      if (priceType === "INFANT") {
        passengerType = "INFANT";
      } else if (priceType === "CHILD") {
        passengerType = "CHILD";
      } else {
        passengerType = "ADULT";
      }
    } else if (!passenger.esAdulto) {
      passengerType = "CHILD";
    }

    // Construir restrictions object
    const restrictions: Record<string, unknown> = {};
    if (passenger.tieneRestriccionesAlimentarias && passenger.restriccionesAlimentarias) {
      restrictions.foodRestrictions = passenger.restriccionesAlimentarias;
    }
    if (passenger.embarazada) {
      restrictions.pregnant = true;
    }
    if (passenger.problemasColumnaSalud) {
      restrictions.healthIssues = true;
    }

    return {
      type: passengerType,
      firstName,
      lastName,
      birthDate: passenger.fechaNacimiento || undefined,
      documentType: undefined, // No se captura en el frontend actual
      documentNumber: passenger.documento || undefined,
      nationality: undefined, // No se captura en el frontend actual
      email: undefined, // No se captura por pasajero en el frontend actual
      phone: passenger.telefono || undefined,
      restrictions: Object.keys(restrictions).length > 0 ? restrictions : undefined,
    };
  }, []);

  const submitOrder = useCallback(
    async (data: OrderSubmissionData) => {
      const { bookingData, passengers, billingInfo, paymentMethod, hasRestrictionViolations } = data;

      setIsSubmitting(true);
      setError(null);

      try {
        // Determinar tipo de orden
        // Es consulta si: excede disponibilidad, tiene restricciones, o no hay método de pago
        const orderType: "reserva" | "consulta" =
          bookingData.exceedsAvailability || hasRestrictionViolations || !paymentMethod ? "consulta" : "reserva";

        // Asegurar que pricing tenga currencyCode (migración de datos antiguos)
        const pricing: Pricing = bookingData.pricing.currencyCode 
          ? bookingData.pricing as Pricing
          : { ...bookingData.pricing, currencyCode: "ARS" };

        // Crear orden para localStorage (compatibilidad)
        const order: Order = {
          orderId: generateOrderId(),
          tourId: bookingData.tourId,
          tourTitle: bookingData.tourTitle,
          date: bookingData.date,
          adults: bookingData.adults,
          children: bookingData.children,
          pricing,
          timeSlot: bookingData.timeSlot,
          passengers,
          billingInfo,
          paymentMethod,
          orderType,
          exceedsAvailability: bookingData.exceedsAvailability,
          createdAt: new Date().toISOString(),
        };

        // Crear orden (API o localStorage)
        if (useAPI) {
          // Convertir datos al formato de la API
          const apiData: CreateOrderRequest = {
            tourId: bookingData.tourId, // slug
            date: bookingData.date,
            startTime: bookingData.timeSlot.start,
            numAdults: bookingData.adults,
            numChildren: bookingData.children,
            currency: pricing.currencyCode,
            customerName: `${billingInfo.nombreCompleto} ${billingInfo.apellidos}`.trim(),
            customerEmail: billingInfo.email,
            customerPhone: billingInfo.telefono,
            passengers: passengers.map(p => convertPassengerToAPI(p, pricing)),
            notes: billingInfo.notasPedido,
            paymentMethod,
            exceedsAvailability: bookingData.exceedsAvailability,
            hasRestrictionViolations,
            additionals: order.additionals,
          };

          // Llamar a la API
          const createdOrder = await createOrder(apiData);
          
          // Actualizar order con datos de la respuesta
          order.orderId = createdOrder.id;
          
          clearPendingBooking();
          onCheckoutComplete(order);
        } else {
          // Usar localStorage (comportamiento actual)
          saveOrder(order);
          clearPendingBooking();
          onCheckoutComplete(order);
        }
      } catch (err) {
        let errorMessage = "Error al crear la orden";
        
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === "object" && err !== null && "message" in err) {
          errorMessage = String(err.message);
        }
        
        // Si es un error de validación de la API, mostrar mensaje más claro
        if (err instanceof Error && err.message.includes("validation")) {
          errorMessage = "Por favor, verifica que todos los campos estén completos correctamente.";
        }
        
        setError(errorMessage);
        console.error("Error al crear la orden:", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onCheckoutComplete, useAPI, convertPassengerToAPI]
  );

  return {
    submitOrder,
    isSubmitting,
    error,
  };
}

