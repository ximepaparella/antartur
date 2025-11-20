/**
 * Hook para manejar cálculos de precios en MiniCart
 */

import { useMemo } from "react";
import type { Pricing } from "@/lib/types/order";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getFullTourById } from "@/modules/tours/components/ToursGrid/tourFullData";
import { getTourPriceByCurrency } from "@/lib/utils/pricingHelpers";

interface UseMiniCartPricingProps {
  pricing: Pricing;
  tourId?: string;
  adults: number;
  childrenCount: number;
}

interface UseMiniCartPricingReturn {
  currentPricing: Pricing;
  subtotalAdults: number;
  subtotalChildren: number;
  total: number;
}

/**
 * Hook para calcular precios en MiniCart
 * Resuelve pricing desde tourId si está disponible según la moneda seleccionada, sino usa el pricing prop
 */
export function useMiniCartPricing({
  pricing,
  tourId,
  adults,
  childrenCount,
}: UseMiniCartPricingProps): UseMiniCartPricingReturn {
  const { currency } = useCurrency();
  const defaultCurrency = "ARS"; // Moneda por defecto

  // Obtener pricing completo del tour si tenemos tourId, según la moneda seleccionada
  const currentPricing = useMemo(() => {
    if (tourId) {
      const tour = getFullTourById(tourId);
      // Priorizar prices (nuevo formato) sobre pricing (legacy)
      if (tour?.booking?.prices) {
        const priceData = getTourPriceByCurrency(tour.booking.prices, currency, defaultCurrency);
        if (priceData) {
          return {
            priceAdult: priceData.adult,
            priceChild: priceData.child,
            currencyCode: priceData.currencyCode,
          } as Pricing;
        }
      }
      // Fallback a pricing legacy si no hay prices
      if (tour?.booking?.pricing) {
        const tourPricing = tour.booking.pricing as any;
        return {
          priceAdult: tourPricing.priceAdult,
          priceChild: tourPricing.priceChild,
          currencyCode: tourPricing.currencyCode || tourPricing.currency || currency,
        } as Pricing;
      }
    }
    // Si no hay tourId o no se encontraron precios, usar el pricing prop
    // pero asegurar que tenga la moneda correcta
    return {
      ...pricing,
      currencyCode: pricing.currencyCode || currency,
    };
  }, [pricing, tourId, currency, defaultCurrency]);

  const subtotalAdults = useMemo(() => {
    return adults * currentPricing.priceAdult;
  }, [adults, currentPricing.priceAdult]);

  const subtotalChildren = useMemo(() => {
    return childrenCount * currentPricing.priceChild;
  }, [childrenCount, currentPricing.priceChild]);

  const total = useMemo(() => {
    return subtotalAdults + subtotalChildren;
  }, [subtotalAdults, subtotalChildren]);

  return {
    currentPricing,
    subtotalAdults,
    subtotalChildren,
    total,
  };
}

