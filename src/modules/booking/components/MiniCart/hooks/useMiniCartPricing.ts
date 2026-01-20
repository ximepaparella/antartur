/**
 * Hook para manejar cálculos de precios en MiniCart
 */

import { useMemo, useState, useEffect } from "react";
import type { Pricing } from "@/lib/types/order";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toursClient } from "@/modules/tours/api/client/toursClient";
import { getTourPriceByCurrency } from "@/lib/utils/pricingHelpers";
import type { SelectedAdditional } from "@/lib/types/order";
import type { TourPrice } from "@/modules/tours/components/admin/TourForm/types";
import {
  calculateSubtotalAdults,
  calculateSubtotalChildren,
  calculateOrderTotal,
  calculateAdditionalsSubtotal,
} from "@/lib/utils/pricing";

interface UseMiniCartPricingProps {
  pricing: Pricing;
  tourId?: string;
  adults: number;
  childrenCount: number;
  additionals?: SelectedAdditional[];
}

interface UseMiniCartPricingReturn {
  currentPricing: Pricing;
  subtotalAdults: number;
  subtotalChildren: number;
  additionalsSubtotal: number;
  total: number;
  normalizedAdditionals: SelectedAdditional[];
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
  additionals = [],
}: UseMiniCartPricingProps): UseMiniCartPricingReturn {
  // Safe access to currency context - fallback to ARS if not available (e.g., during SSR/build)
  let currency: "ARS" | "USD" = "ARS";
  try {
    const currencyContext = useCurrency();
    currency = currencyContext.currency;
  } catch (error) {
    // Context not available (e.g., during build/prerender)
    // Use default currency
    currency = "ARS";
  }
  const defaultCurrency = "ARS"; // Moneda por defecto

  // Obtener tour desde la API si tenemos tourId
  const [tourData, setTourData] = useState<any>(null);

  useEffect(() => {
    if (tourId) {
      toursClient.client
        .getBySlug(tourId, { includePrices: true })
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
      const pricesMap: {
        ARS?: { adult: number; child: number };
        USD?: { adult: number; child: number };
      } = {};
      tourData.prices.forEach((p: TourPrice) => {
        if (p.currency === "ARS") {
          pricesMap.ARS = {
            adult: Number(p.priceAdult),
            child: Number(p.priceChild),
          };
        } else if (p.currency === "USD") {
          pricesMap.USD = {
            adult: Number(p.priceAdult),
            child: Number(p.priceChild),
          };
        }
      });

      const priceData = getTourPriceByCurrency(
        pricesMap,
        currency,
        defaultCurrency,
      );
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

  // Normalizar additionals: mostrar todos los additionals, pero solo calcular subtotal de los que tienen la moneda correcta
  // Los additionals ya deberían estar normalizados desde checkout cuando cambia la moneda
  const normalizedAdditionals = useMemo(() => {
    if (!additionals || additionals.length === 0) {
      return [];
    }
    // Mostrar todos los additionals que se pasan, asumiendo que ya están normalizados desde checkout
    // Si alguno tiene moneda diferente, aún lo mostramos pero no se incluirá en el cálculo del subtotal
    return additionals;
  }, [additionals]);

  const subtotalAdults = useMemo(() => {
    return calculateSubtotalAdults(adults, currentPricing);
  }, [adults, currentPricing]);

  const subtotalChildren = useMemo(() => {
    return calculateSubtotalChildren(childrenCount, currentPricing);
  }, [childrenCount, currentPricing]);

  // Filtrar additionals para el cálculo del subtotal (solo los que tienen la moneda correcta)
  const additionalsForCalculation = useMemo(() => {
    return normalizedAdditionals.filter(
      (additional) => additional.currency === currentPricing.currencyCode,
    );
  }, [normalizedAdditionals, currentPricing.currencyCode]);

  const additionalsSubtotal = useMemo(() => {
    return calculateAdditionalsSubtotal(
      additionalsForCalculation,
      adults,
      childrenCount,
      currentPricing,
    );
  }, [additionalsForCalculation, adults, childrenCount, currentPricing]);

  const total = useMemo(() => {
    return calculateOrderTotal(
      adults,
      childrenCount,
      currentPricing,
      additionalsForCalculation,
    );
  }, [adults, childrenCount, currentPricing, additionalsForCalculation]);

  return {
    currentPricing,
    subtotalAdults,
    subtotalChildren,
    additionalsSubtotal,
    total,
    normalizedAdditionals,
  };
}
