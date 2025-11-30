"use client";

import React from "react";
import type { TourAdditional } from "@/modules/tours/types/tourTypes";
import type { SelectedAdditional } from "@/lib/types/order";
import { useCurrency } from "@/contexts/CurrencyContext";
import styles from "./TourAdditionalsSelector.module.scss";

interface TourAdditionalsSelectorProps {
  /** Lista de additionals disponibles para el tour */
  additionals: TourAdditional[];
  /** Additionals actualmente seleccionados */
  selectedAdditionals: SelectedAdditional[];
  /** Callback cuando se selecciona/deselecciona un additional */
  onSelectionChange: (additionals: SelectedAdditional[]) => void;
  /** Moneda actual para mostrar precios */
  currency: string;
}

/**
 * Componente TourAdditionalsSelector para seleccionar additionals/add-ons en el modal de reserva
 * 
 * Muestra checkboxes para cada additional disponible con su precio
 * y permite seleccionar múltiples additionals que se sumarán al total
 */
export const TourAdditionalsSelector: React.FC<TourAdditionalsSelectorProps> = ({
  additionals,
  selectedAdditionals,
  onSelectionChange,
  currency,
}) => {
  const { formatPrice } = useCurrency();

  if (!additionals || additionals.length === 0) {
    return null;
  }

  const handleToggle = (additional: TourAdditional) => {
    const isSelected = selectedAdditionals.some((sa) => sa.additionalId === additional.id);

    if (isSelected) {
      // Deseleccionar
      const updated = selectedAdditionals.filter((sa) => sa.additionalId !== additional.id);
      onSelectionChange(updated);
    } else {
      // Seleccionar
      const prices = additional.prices[currency as "ARS" | "USD"];
      if (prices) {
        const newSelected: SelectedAdditional = {
          additionalId: additional.id,
          name: additional.name,
          priceAdult: prices.adult,
          priceChild: prices.child,
          currency,
        };
        onSelectionChange([...selectedAdditionals, newSelected]);
      }
    }
  };

  return (
    <div className={styles.additionalsSelector}>
      <h3 className={styles.title}>Opciones adicionales</h3>
      <div className={styles.list}>
        {additionals.map((additional) => {
          const isSelected = selectedAdditionals.some((sa) => sa.additionalId === additional.id);
          const prices = additional.prices[currency as "ARS" | "USD"];

          if (!prices) {
            return null;
          }

          return (
            <label key={additional.id} className={styles.item}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(additional)}
                className={styles.checkbox}
              />
              <div className={styles.content}>
                <span className={styles.name}>{additional.name}</span>
                {additional.description && (
                  <span className={styles.description}>{additional.description}</span>
                )}
                <span className={styles.price}>
                  + {formatPrice(prices.adult)} / adulto
                  {prices.child !== prices.adult && `, ${formatPrice(prices.child)} / menor`}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

