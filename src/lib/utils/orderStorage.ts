/**
 * Utilidades para manejar el almacenamiento de órdenes en localStorage
 */

import type { Order } from "../types/order";
import { toursClient } from "@/modules/tours/api/client/toursClient";

const PENDING_BOOKING_KEY = "pendingBooking";
const ORDER_KEY_PREFIX = "order_";

/**
 * Guarda los datos iniciales de la reserva desde el calendario
 */
export function savePendingBooking(bookingData: {
  tourId: string;
  tourTitle: string;
  date: string;
  adults: number;
  children: number;
  pricing: { currencyCode: string; priceAdult: number; priceChild: number };
  timeSlot: { start: string; end: string };
  exceedsAvailability: boolean;
}): void {
  try {
    localStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(bookingData));
  } catch (error) {
    console.error("Error al guardar datos de reserva:", error);
  }
}

/**
 * Calcula si excede la disponibilidad basado en la fecha y número de pasajeros
 * Nota: Esta función es síncrona pero necesita datos de la API, por lo que retorna false por defecto
 * La verificación real se hace en el servidor al crear la orden
 */
function calculateExceedsAvailability(
  tourId: string,
  date: string,
  timeSlot: { start: string; end: string },
  adults: number,
  children: number
): boolean {
  // Esta función ya no puede hacer fetch síncrono desde la API
  // La verificación real se hace en el servidor al crear la orden
  // Retornamos false por defecto para no bloquear la UI
  return false;
}

/**
 * Actualiza la cantidad de adultos y niños en la reserva pendiente
 * También recalcula si excede la disponibilidad
 */
export function updatePendingBookingPassengers(adults: number, children: number): void {
  try {
    const data = getPendingBooking();
    if (data) {
      // Recalcular exceedsAvailability basado en la nueva cantidad de pasajeros
      const exceedsAvailability = calculateExceedsAvailability(
        data.tourId,
        data.date,
        data.timeSlot,
        adults,
        children
      );
      
      savePendingBooking({
        ...data,
        adults,
        children,
        exceedsAvailability,
      });
    }
  } catch (error) {
    console.error("Error al actualizar pasajeros de reserva:", error);
  }
}

/**
 * Obtiene los datos iniciales de la reserva
 */
export function getPendingBooking(): {
  tourId: string;
  tourTitle: string;
  date: string;
  adults: number;
  children: number;
  pricing: { currencyCode: string; priceAdult: number; priceChild: number };
  timeSlot: { start: string; end: string };
  exceedsAvailability: boolean;
} | null {
  try {
    const data = localStorage.getItem(PENDING_BOOKING_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error("Error al leer datos de reserva:", error);
    return null;
  }
}

/**
 * Guarda una orden completa
 */
export function saveOrder(order: Order): void {
  try {
    const key = `${ORDER_KEY_PREFIX}${order.orderId}`;
    localStorage.setItem(key, JSON.stringify(order));
    // También guardar el ID de la última orden
    localStorage.setItem("lastOrderId", order.orderId);
  } catch (error) {
    console.error("Error al guardar orden:", error);
  }
}

/**
 * Obtiene una orden por ID
 */
export function getOrder(orderId: string): Order | null {
  try {
    const key = `${ORDER_KEY_PREFIX}${orderId}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error("Error al leer orden:", error);
    return null;
  }
}

/**
 * Genera un ID único para la orden
 */
export function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Limpia los datos de reserva pendiente
 */
export function clearPendingBooking(): void {
  try {
    localStorage.removeItem(PENDING_BOOKING_KEY);
  } catch (error) {
    console.error("Error al limpiar datos de reserva:", error);
  }
}

/**
 * Clave para almacenar datos de orden completada en sessionStorage
 */
const COMPLETED_ORDER_DATA_KEY = "completedOrderData";

/**
 * Interfaz para los datos de orden completada que se pasan entre páginas
 */
export interface CompletedOrderData {
  code: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  currency: string;
  type?: "RESERVATION" | "ENQUIRY";
  paymentMethod?: "transferencia" | "paypal" | "payway";
  // Detalles de la orden
  tourTitle: string;
  date: string;
  timeSlot: {
    start: string;
    end: string;
  };
  adults: number;
  children: number;
  passengers: Array<{
    nombreCompleto: string;
    esAdulto: boolean;
  }>;
}

/**
 * Guarda los datos de orden completada en sessionStorage
 * (más seguro que pasarlos por URL)
 */
export function saveCompletedOrderData(data: CompletedOrderData): void {
  try {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(COMPLETED_ORDER_DATA_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error("Error al guardar datos de orden completada:", error);
  }
}

/**
 * Obtiene los datos de orden completada desde sessionStorage
 */
export function getCompletedOrderData(): CompletedOrderData | null {
  try {
    if (typeof window !== "undefined") {
      const data = sessionStorage.getItem(COMPLETED_ORDER_DATA_KEY);
      if (!data) return null;
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error("Error al leer datos de orden completada:", error);
    return null;
  }
}

/**
 * Limpia los datos de orden completada de sessionStorage
 */
export function clearCompletedOrderData(): void {
  try {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(COMPLETED_ORDER_DATA_KEY);
    }
  } catch (error) {
    console.error("Error al limpiar datos de orden completada:", error);
  }
}

