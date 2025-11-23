/**
 * Hook para manejar cálculos de precios en MiniCart
 */

import { useMemo, useState, useEffect } from "react";
import type { Pricing } from "@/lib/types/order";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getTourBySlugClient } from "@/lib/api/tours-client";
import { getTourPriceByCurrency } from "@/lib/utils/pricingHelpers";
import {
  calculateSubtotalAdults,
  calculateSubtotalChildren,
  calculateOrderTotal,
} from "@/lib/utils/pricing";

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

  // Obtener tour desde la API si tenemos tourId
  const [tourData, setTourData] = useState<any>(null);

  useEffect(() => {
    if (tourId) {
      getTourBySlugClient(tourId, { includePrices: true })
        .then((tour) => {
          if (tour) {
            setTourData(tour);
          }
        })
        .catch((error) => {
          console.error("Error al obtener tour:", error);
        });
    }
  }, [tourId]);

  // Obtener pricing completo del tour si tenemos tourId, según la moneda seleccionada
  const currentPricing = useMemo(() => {
    if (tourId && tourData?.prices) {
      // Convertir prices de la API al formato esperado por getTourPriceByCurrency
      const pricesMap: { ARS?: { adult: number; child: number }; USD?: { adult: number; child: number } } = {};
      tourData.prices.forEach((p: any) => {
        if (p.currency === "ARS") {
          pricesMap.ARS = { adult: Number(p.priceAdult), child: Number(p.priceChild) };
        } else if (p.currency === "USD") {
          pricesMap.USD = { adult: Number(p.priceAdult), child: Number(p.priceChild) };
        }
      });
      
      const priceData = getTourPriceByCurrency(pricesMap, currency, defaultCurrency);
      if (priceData) {
        return {
          priceAdult: priceData.adult,
          priceChild: priceData.child,
          currencyCode: priceData.currencyCode,
        } as Pricing;
      }
    }
    // Si no hay tourId o no se encontraron precios, usar el pricing prop
    // pero asegurar que tenga la moneda correcta
    return {
      ...pricing,
      currencyCode: pricing.currencyCode || currency,
    };
  }, [pricing, tourId, currency, defaultCurrency, tourData]);

  const subtotalAdults = useMemo(() => {
    return calculateSubtotalAdults(adults, currentPricing);
  }, [adults, currentPricing]);

  const subtotalChildren = useMemo(() => {
    return calculateSubtotalChildren(childrenCount, currentPricing);
  }, [childrenCount, currentPricing]);

  const total = useMemo(() => {
    return calculateOrderTotal(adults, childrenCount, currentPricing);
  }, [adults, childrenCount, currentPricing]);

  return {
    currentPricing,
    subtotalAdults,
    subtotalChildren,
    total,
  };
}

