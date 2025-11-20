/**
 * Utilidades para cálculos de precios
 */

import type { Pricing } from "@/lib/types/order";

/**
 * Calcula el subtotal de adultos
 */
export function calculateSubtotalAdults(adults: number, pricing: Pricing): number {
  return adults * pricing.priceAdult;
}

/**
 * Calcula el subtotal de niños
 */
export function calculateSubtotalChildren(children: number, pricing: Pricing): number {
  return children * pricing.priceChild;
}

/**
 * Calcula el subtotal completo (adultos + niños)
 */
export function calculateSubtotal(
  adults: number,
  children: number,
  pricing: Pricing
): { adults: number; children: number; total: number } {
  const subtotalAdults = calculateSubtotalAdults(adults, pricing);
  const subtotalChildren = calculateSubtotalChildren(children, pricing);
  return {
    adults: subtotalAdults,
    children: subtotalChildren,
    total: subtotalAdults + subtotalChildren,
  };
}

/**
 * Calcula el total de la orden (adultos + niños)
 */
export function calculateOrderTotal(
  adults: number,
  children: number,
  pricing: Pricing
): number {
  return calculateSubtotalAdults(adults, pricing) + calculateSubtotalChildren(children, pricing);
}

