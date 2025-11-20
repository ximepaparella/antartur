/**
 * Helpers para obtener precios según la moneda seleccionada
 */

import type { Pricing } from "@/lib/types/order";

/**
 * Obtiene el precio según la moneda seleccionada desde un objeto de precios por moneda
 */
export function getPriceByCurrency(
  prices: {
    ARS?: { adult: number; child: number };
    USD?: { adult: number; child: number };
  },
  currency: "ARS" | "USD" = "ARS"
): Pricing {
  const priceData = prices[currency];
  
  if (!priceData) {
    // Fallback a ARS si no existe la moneda solicitada
    const fallbackPrice = prices.ARS || prices.USD;
    if (!fallbackPrice) {
      throw new Error(`No prices available for currency ${currency}`);
    }
    return {
      priceAdult: fallbackPrice.adult,
      priceChild: fallbackPrice.child,
      currencyCode: prices.ARS ? "ARS" : "USD",
    };
  }
  
  return {
    priceAdult: priceData.adult,
    priceChild: priceData.child,
    currencyCode: currency,
  };
}

/**
 * Convierte un pricing legacy (sin currency) a Pricing con currencyCode
 */
export function ensurePricingWithCurrency(
  pricing: { priceAdult: number; priceChild: number },
  currency: string = "ARS"
): Pricing {
  return {
    ...pricing,
    currencyCode: currency,
  };
}

/**
 * Obtiene el precio según la moneda seleccionada desde un objeto de precios por moneda
 * Retorna el precio con la moneda correspondiente o fallback a la moneda por defecto
 */
export function getTourPriceByCurrency(
  prices: {
    ARS?: { adult: number; child: number };
    USD?: { adult: number; child: number };
  },
  selectedCurrency: string,
  defaultCurrency: string = "ARS"
): { adult: number; child: number; currencyCode: string } | null {
  // Intentar obtener precio para la moneda seleccionada
  const selectedPrice = prices[selectedCurrency as keyof typeof prices];
  if (selectedPrice) {
    return {
      ...selectedPrice,
      currencyCode: selectedCurrency,
    };
  }

  // Fallback a la moneda por defecto
  const defaultPrice = prices[defaultCurrency as keyof typeof prices];
  if (defaultPrice) {
    return {
      ...defaultPrice,
      currencyCode: defaultCurrency,
    };
  }

  // Si no hay ninguna moneda disponible, retornar null
  return null;
}

