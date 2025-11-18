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
  if (currency === "USD" && pricing.priceAdultUSD !== undefined && pricing.priceChildUSD !== undefined) {
    return {
      priceAdult: pricing.priceAdultUSD,
      priceChild: pricing.priceChildUSD,
    };
  }
  return {
    priceAdult: pricing.priceAdult,
    priceChild: pricing.priceChild,
  };
}

