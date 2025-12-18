/**
 * Utilidades para cálculos de precios
 */

import type { Pricing, SelectedAdditional } from "@/lib/types/order";

/**
 * Calcula la edad a partir de una fecha de nacimiento
 */
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Determina el tipo de pasajero según la edad y configuración de precios
 */
export type PassengerPriceType = "INFANT" | "CHILD" | "ADULT";

export function getPassengerPriceType(
  age: number,
  pricing: Pricing
): PassengerPriceType {
  const infantMaxAge = pricing.infantMaxAge ?? 3;
  const childAgeRange = pricing.childAgeRange;

  // Si tiene priceInfantFree y está en rango de infant
  if (pricing.priceInfantFree && age <= infantMaxAge) {
    return "INFANT";
  }

  // Determinar rango de child según childAgeRange
  if (childAgeRange) {
    const [minAge, maxAge] = childAgeRange.split("-").map(Number);
    if (age >= minAge && age <= maxAge) {
      return "CHILD";
    }
  } else {
    // Comportamiento legacy: si no hay childAgeRange, usar 12 como límite
    if (age < 12) {
      return "CHILD";
    }
  }

  return "ADULT";
}

/**
 * Calcula el precio para un pasajero según su edad y tipo
 */
export function calculatePassengerPrice(
  age: number,
  pricing: Pricing
): number {
  const priceType = getPassengerPriceType(age, pricing);

  if (priceType === "INFANT" && pricing.priceInfantFree) {
    return 0;
  }

  if (priceType === "CHILD") {
    const childPriceType = pricing.childPriceType ?? "FULL_CHILD_PRICE";
    
    if (childPriceType === "HALF_ADULT_PRICE") {
      return pricing.priceAdult * 0.5;
    } else if (childPriceType === "ADULT_PRICE") {
      return pricing.priceAdult;
    } else {
      // FULL_CHILD_PRICE (default)
      return pricing.priceChild;
    }
  }

  // ADULT
  return pricing.priceAdult;
}

/**
 * Calcula el subtotal de adultos (mantiene compatibilidad legacy)
 */
export function calculateSubtotalAdults(adults: number, pricing: Pricing): number {
  return adults * pricing.priceAdult;
}

/**
 * Calcula el subtotal de niños (mantiene compatibilidad legacy)
 * Nota: Esta función usa priceChild directamente. Para cálculos precisos por edad,
 * usar calculateSubtotalByAgeRange
 */
export function calculateSubtotalChildren(children: number, pricing: Pricing): number {
  return children * pricing.priceChild;
}

/**
 * Calcula el subtotal por rango de edad usando las edades reales de los pasajeros
 */
export function calculateSubtotalByAgeRange(
  passengers: Array<{ birthDate: string }>,
  pricing: Pricing
): {
  infants: number;
  children: number;
  adults: number;
  total: number;
  breakdown: Array<{ age: number; price: number; type: PassengerPriceType }>;
} {
  let subtotalInfants = 0;
  let subtotalChildren = 0;
  let subtotalAdults = 0;
  const breakdown: Array<{ age: number; price: number; type: PassengerPriceType }> = [];

  for (const passenger of passengers) {
    const age = calculateAge(passenger.birthDate);
    const priceType = getPassengerPriceType(age, pricing);
    const price = calculatePassengerPrice(age, pricing);

    breakdown.push({ age, price, type: priceType });

    if (priceType === "INFANT") {
      subtotalInfants += price;
    } else if (priceType === "CHILD") {
      subtotalChildren += price;
    } else {
      subtotalAdults += price;
    }
  }

  return {
    infants: subtotalInfants,
    children: subtotalChildren,
    adults: subtotalAdults,
    total: subtotalInfants + subtotalChildren + subtotalAdults,
    breakdown,
  };
}

/**
 * Calcula el subtotal de additionals seleccionados
 * Nota: Los additionals tienen precio único (no por pasajero)
 */
export function calculateAdditionalsSubtotal(
  additionals: SelectedAdditional[],
  adults: number,
  children: number,
  pricing: Pricing
): number {
  let total = 0;

  for (const additional of additionals) {
    // Solo sumar si la moneda coincide
    // El precio es único, no se multiplica por cantidad de pasajeros
    if (additional.currency === pricing.currencyCode) {
      total += additional.priceAdult; // Usar priceAdult como precio único
    }
  }

  return total;
}

/**
 * Calcula el subtotal completo (adultos + niños) - mantiene compatibilidad legacy
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
 * Calcula el total de la orden (adultos + niños + additionals)
 */
export function calculateOrderTotal(
  adults: number,
  children: number,
  pricing: Pricing,
  additionals?: SelectedAdditional[]
): number {
  const baseTotal = calculateSubtotalAdults(adults, pricing) + calculateSubtotalChildren(children, pricing);
  
  if (additionals && additionals.length > 0) {
    const additionalsTotal = calculateAdditionalsSubtotal(additionals, adults, children, pricing);
    return baseTotal + additionalsTotal;
  }

  return baseTotal;
}

/**
 * Valida si un pasajero cumple con la edad mínima requerida
 */
export function validateMinAge(age: number, minAge: number | null | undefined): boolean {
  if (!minAge) return true;
  return age >= minAge;
}

/**
 * Valida si el número total de pasajeros cumple con el mínimo requerido
 */
export function validateMinPassengers(
  totalPassengers: number,
  minPassengers: number | null | undefined
): boolean {
  if (!minPassengers) return true;
  return totalPassengers >= minPassengers;
}

