import type { Currency } from "@/contexts/CurrencyContext";

/**
 * Formatea un precio según la moneda seleccionada
 * ARS: $1.500
 * USD: USD 1,000.00
 */
export function formatPrice(amount: number, currency: Currency): string {
  if (currency === "ARS") {
    // Formato argentino: $1.500 (sin decimales)
    return `$${amount.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
  } else {
    // Formato USD: USD 1,000.00
    return `USD ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

/**
 * Obtiene el precio según la moneda seleccionada
 * 
 * IMPORTANTE: Esta función asume que:
 * - priceAdult y priceChild son SIEMPRE valores en ARS (nunca deben modificarse)
 * - priceAdultUSD y priceChildUSD son valores en USD (opcionales)
 * 
 * Si priceAdultUSD/priceChildUSD no están disponibles, se usan los valores ARS.
 */
export function getPriceByCurrency(
  pricing: {
    priceAdult: number;
    priceChild: number;
    priceAdultUSD?: number;
    priceChildUSD?: number;
  },
  currency: Currency
): {
  priceAdult: number;
  priceChild: number;
} {
  // Si la moneda es USD y tenemos valores USD disponibles, usarlos
  if (currency === "USD") {
    if (pricing.priceAdultUSD !== undefined && pricing.priceChildUSD !== undefined) {
      return {
      priceAdult: pricing.priceAdultUSD,
      priceChild: pricing.priceChildUSD,
    };
    }
    // Si no hay valores USD pero el precio ARS es muy pequeño (probablemente ya está en USD),
    // intentar detectar esto y advertir, pero usar los valores disponibles
    // Esto es un fallback para casos edge
    console.warn("[getPriceByCurrency] USD requested but priceAdultUSD/priceChildUSD not available, using ARS values");
  }
  
  // Para ARS o cuando no hay valores USD disponibles, usar priceAdult/priceChild (que deben ser ARS)
  return {
    priceAdult: pricing.priceAdult,
    priceChild: pricing.priceChild,
  };
}

