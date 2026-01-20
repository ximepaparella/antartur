"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/common/Button/Button";
import { Icon, IconName } from "@/components/icons/Icon";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPriceByCurrency } from "@/lib/utils/priceFormat";
import { toursClient } from "@/modules/tours/api/client/toursClient";
import { getTourPriceByCurrency } from "@/lib/utils/pricingHelpers";
import type { TourPrice } from "@/modules/tours/components/admin/TourForm/types";
import styles from "./TourQuickInfo.module.scss";

export interface QuickInfoItem {
  id: string;
  label: string;
  value: string;
  icon: IconName;
}

interface TourQuickInfoProps {
  /** ID del tour para obtener precios dinámicos */
  tourId: string;
  /** Precio del tour (legacy, usado como fallback) */
  price: string;
  /** Items de información rápida (duración, dificultad, etc.) */
  items: QuickInfoItem[];
  /** Restricciones o advertencias opcionales */
  restrictions?: string[];
  /** Alternativa opcional (otro tour relacionado) */
  alternative?: {
    text: string;
    price: string;
  };
  /** Texto del CTA de reserva */
  ctaLabel: string;
  /** URL del CTA de reserva */
  ctaHref: string;
  /** Si hay datos de precio para mostrar */
  hasPricing?: boolean;
}

/**
 * Componente QuickInfo para tours
 * Muestra precio, items de información y CTA de reserva en un fondo primary
 * El precio se actualiza automáticamente según la moneda seleccionada
 */
export const TourQuickInfo: React.FC<TourQuickInfoProps> = ({
  tourId,
  price,
  items,
  restrictions,
  alternative,
  ctaLabel,
  ctaHref,
  hasPricing = true,
}) => {
  const { currency } = useCurrency();
  const defaultCurrency = "ARS"; // Moneda por defecto
  const [tourData, setTourData] = useState<any>(null);

  useEffect(() => {
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
  }, [tourId]);

  // Obtener precio según la moneda seleccionada
  const displayPrice = React.useMemo(() => {
    if (tourData?.prices) {
      const pricesMap = tourData.prices.reduce(
        (
          acc: Record<string, { adult: number; child: number }>,
          p: TourPrice,
        ) => {
          acc[p.currency] = {
            adult: Number(p.priceAdult),
            child: Number(p.priceChild),
          };
          return acc;
        },
        {},
      );
      const priceData = getTourPriceByCurrency(
        pricesMap,
        currency,
        defaultCurrency,
      );
      if (priceData) {
        return formatPriceByCurrency(priceData.adult, priceData.currencyCode);
      }
    }
    // Fallback al precio legacy si no hay precios por moneda
    return price;
  }, [tourData, currency, defaultCurrency, price]);

  // Obtener precio alternativo si existe
  const alternativePrice = React.useMemo(() => {
    if (!alternative?.price) return null;

    // Intentar parsear el precio alternativo si es numérico
    const parsedPrice = parseFloat(alternative.price.replace(/[^0-9.-]+/g, ""));
    if (!isNaN(parsedPrice) && tourData?.prices) {
      const pricesMap = tourData.prices.reduce(
        (
          acc: Record<string, { adult: number; child: number }>,
          p: TourPrice,
        ) => {
          acc[p.currency] = {
            adult: Number(p.priceAdult),
            child: Number(p.priceChild),
          };
          return acc;
        },
        {},
      );
      const priceData = getTourPriceByCurrency(
        pricesMap,
        currency,
        defaultCurrency,
      );
      if (priceData) {
        // Usar el mismo precio relativo (simplificado)
        return formatPriceByCurrency(parsedPrice, priceData.currencyCode);
      }
    }
    return alternative.price;
  }, [alternative, tourData, currency, defaultCurrency]);

  return (
    <section className={styles.quickInfo} id="quick-info">
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.topSection}>
            {hasPricing && (
              <div className={styles.priceColumn}>
                <div className={styles.priceLabel}>Precio</div>
                <div className={styles.priceValue}>{displayPrice}</div>
              </div>
            )}

            <div className={styles.ctaColumn}>
              <Button variant="tertiary" href={ctaHref} size="large">
                {ctaLabel}
              </Button>
            </div>
          </div>

          <ul className={styles.itemsColumn}>
            {items.map((item) => (
              <li key={item.id} className={styles.item}>
                <Icon name={item.icon} size={24} className={styles.icon} />
                <div className={styles.itemContent}>
                  {item.label && (
                    <span className={styles.itemLabel}>{item.label}</span>
                  )}
                  <span className={styles.itemValue}>{item.value}</span>
                </div>
              </li>
            ))}
            {restrictions &&
              restrictions.length > 0 &&
              restrictions.map((restriction, index) => (
                <li
                  key={`restriction-${index}`}
                  className={`${styles.item} ${styles.itemFullWidth}`}
                >
                  <Icon name="info" size={24} className={styles.icon} />
                  <div className={styles.itemContent}>
                    <span className={styles.itemValue}>{restriction}</span>
                  </div>
                </li>
              ))}
            {alternative && alternativePrice && (
              <li key="alternative" className={styles.item}>
                <Icon name="map-route" size={24} className={styles.icon} />
                <div
                  className={`${styles.itemContent} ${styles.itemContentRow}`}
                >
                  <span className={styles.itemValue}>{alternative.text}</span>
                  <span className={styles.itemValue}>{alternativePrice}</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
};
