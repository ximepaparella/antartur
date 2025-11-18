/**
 * Utilidades para manejar el almacenamiento de órdenes en localStorage
 */

import type { Order } from "../types/order";
import { getFullTourById } from "@/modules/tours/components/ToursGrid/tourFullData";

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
  pricing: { priceAdult: number; priceChild: number };
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
 */
function calculateExceedsAvailability(
  tourId: string,
  date: string,
  timeSlot: { start: string; end: string },
  adults: number,
  children: number
): boolean {
  try {
    const tour = getFullTourById(tourId);
    
    if (!tour?.booking?.availability) {
      return false;
    }
    
    // Buscar la disponibilidad para la fecha y timeSlot específicos
    const availability = tour.booking.availability.find(
      (avail) => avail.date === date && 
                 avail.timeSlot.start === timeSlot.start && 
                 avail.timeSlot.end === timeSlot.end
    );
    
    if (!availability) {
      return false;
    }
    
    return adults + children > availability.available;
  } catch (error) {
    console.error("Error al calcular disponibilidad:", error);
    return false;
  }
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
  pricing: { priceAdult: number; priceChild: number };
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

