/**
 * Hook para manejar cálculos de precios en MiniCart
 */

import { useMemo } from "react";
import type { Pricing } from "@/lib/types/order";
import { getFullTourById } from "@/modules/tours/components/ToursGrid/tourFullData";

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
 * Resuelve pricing desde tourId si está disponible, sino usa el pricing prop
 */
export function useMiniCartPricing({
  pricing,
  tourId,
  adults,
  childrenCount,
}: UseMiniCartPricingProps): UseMiniCartPricingReturn {
  // Obtener pricing completo del tour si tenemos tourId
  const currentPricing = useMemo(() => {
    if (tourId) {
      const tour = getFullTourById(tourId);
      if (tour?.booking?.pricing) {
        return tour.booking.pricing;
      }
    }
    return pricing;
  }, [pricing, tourId]);

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

