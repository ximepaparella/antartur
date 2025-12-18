"use client";

import React from "react";
import type { SelectedAdditional } from "@/lib/types/order";
import { formatPriceByCurrency } from "@/lib/utils/priceFormat";
import styles from "../MiniCart.module.scss";

interface PricingBreakdownProps {
  adults: number;
  childrenCount: number;
  subtotalAdults: number;
  subtotalChildren: number;
  total: number;
  currency: string;
  additionals?: SelectedAdditional[];
  additionalsSubtotal?: number;
}

/**
 * Componente PricingBreakdown para mostrar el desglose de precios
 */
export const PricingBreakdown: React.FC<PricingBreakdownProps> = ({
  adults,
  childrenCount,
  subtotalAdults,
  subtotalChildren,
  total,
  currency,
  additionals,
  additionalsSubtotal,
}) => {
  return (
    <>
      {adults > 0 && (
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>
            Adultos: {adults}
          </span>
          <span className={styles.summaryValue}>
            {formatPriceByCurrency(subtotalAdults, currency)}
          </span>
        </div>
      )}

      {childrenCount > 0 && (
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>
            Niños: {childrenCount}
          </span>
          <span className={styles.summaryValue}>
            {formatPriceByCurrency(subtotalChildren, currency)}
          </span>
        </div>
      )}

      {additionals && additionals.length > 0 && additionalsSubtotal !== undefined && (
        <>
          {additionals
            .filter(additional => additional.currency === currency) // Solo mostrar additionals con la moneda actual
            .map((additional) => (
              <div key={additional.additionalId} className={styles.summaryRow}>
                <span className={styles.summaryLabel}>
                  {additional.name}
                </span>
                <span className={styles.summaryValue}>
                  {formatPriceByCurrency(
                    additional.priceAdult, // Precio único (no por pasajero)
                    currency
                  )}
                </span>
              </div>
            ))}
        </>
      )}

      <div className={styles.divider} />

      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Subtotal:</span>
        <span className={styles.summaryValue}>{formatPriceByCurrency(total, currency)}</span>
      </div>

      <div className={styles.summaryRow}>
        <span className={styles.summaryLabelTotal}>Total:</span>
        <span className={styles.summaryValueTotal}>{formatPriceByCurrency(total, currency)}</span>
      </div>
    </>
  );
};

