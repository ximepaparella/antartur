"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/common/Button/Button";
import { Icon, IconName } from "@/components/icons/Icon";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPrice, getPriceByCurrency } from "@/lib/utils/priceFormat";
import type { Pricing } from "@/lib/types/order";
import styles from "./TourQuickInfo.module.scss";

export interface QuickInfoItem {
  id: string;
  label: string;
  value: string;
  icon: IconName;
}

interface TourQuickInfoProps {
  /** Precio del tour (string legacy para compatibilidad) */
  price: string;
  /** Pricing completo con precios en ARS y USD */
  pricing?: Pricing;
  /** Items de información rápida (duración, dificultad, etc.) */
  items: QuickInfoItem[];
  /** Restricción o advertencia opcional */
  restriction?: string;
  /** Alternativa opcional (otro tour relacionado) */
  alternative?: {
    text: string;
    price: string;
    priceUSD?: number;
  };
  /** Texto del CTA de reserva */
  ctaLabel: string;
  /** URL del CTA de reserva */
  ctaHref: string;
}

/**
 * Componente QuickInfo para tours
 * Muestra precio, items de información y CTA de reserva en un fondo primary
 */
export const TourQuickInfo: React.FC<TourQuickInfoProps> = ({
  price,
  pricing,
  items,
  restriction,
  alternative,
  ctaLabel,
  ctaHref,
}) => {
  const { currency } = useCurrency();
  const [displayPrice, setDisplayPrice] = useState(price);

  // Función para actualizar el precio
  const updatePrice = useCallback(() => {
    if (pricing) {
      const prices = getPriceByCurrency(pricing, currency);
      // Mostrar precio de adulto como precio principal
      setDisplayPrice(formatPrice(prices.priceAdult, currency));
    } else {
      // Fallback al precio legacy si no hay pricing
      // Solo mostrar si la moneda es ARS (el precio legacy está en ARS)
      if (currency === "ARS") {
        setDisplayPrice(price);
      } else {
        // Si no hay pricing completo y se cambia a USD, ocultar el precio
        setDisplayPrice("");
      }
    }
  }, [currency, pricing, price]);

  useEffect(() => {
    updatePrice();
  }, [updatePrice]);

  // Escuchar cambios de moneda desde el evento personalizado
  useEffect(() => {
    const handleCurrencyChange = () => {
      updatePrice();
    };

    window.addEventListener("currencyChanged", handleCurrencyChange);
    return () => {
      window.removeEventListener("currencyChanged", handleCurrencyChange);
    };
  }, [updatePrice]);

  const alternativePrice = alternative
    ? alternative.priceUSD && currency === "USD"
      ? formatPrice(alternative.priceUSD, currency)
      : alternative.price
    : undefined;

  return (
    <section className={styles.quickInfo} id="quick-info">
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.topSection}>
            <div className={styles.priceColumn}>
              <div className={styles.priceLabel}>Precio</div>
              <div className={styles.priceValue}>{displayPrice}</div>
            </div>
            
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
                  {item.label && <span className={styles.itemLabel}>{item.label}</span>}
                  <span className={styles.itemValue}>{item.value}</span>
                </div>
              </li>
            ))}
            {restriction && (
              <li className={`${styles.item} ${styles.itemFullWidth}`}>
                <Icon name="info" size={24} className={styles.icon} />
                <div className={styles.itemContent}>
                  <span className={styles.itemValue}>{restriction}</span>
                </div>
              </li>
            )}
            {alternative && (
              <li className={styles.item}>
                <Icon name="map-route" size={24} className={styles.icon} />
                <div className={`${styles.itemContent} ${styles.itemContentRow}`}>
                  <span className={styles.itemValue}>{alternative.text}</span>
                  <span className={styles.itemValue}>{alternativePrice || alternative.price}</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
};

