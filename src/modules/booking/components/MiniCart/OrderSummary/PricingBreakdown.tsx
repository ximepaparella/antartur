"use client";

import React from "react";
import type { SelectedAdditional } from "@/lib/types/order";
import { formatPriceByCurrency } from "@/lib/utils/priceFormat";
import { Icon } from "@/components/icons/Icon";
import styles from "../MiniCart.module.scss";

interface PricingBreakdownProps {
  adults: number;
  childrenCount: number;
  infantsCount?: number;
  subtotalAdults: number;
  subtotalChildren: number;
  total: number;
  currency: string;
  additionals?: SelectedAdditional[];
  additionalsSubtotal?: number;
  onRemoveAdditional?: (additionalId: string) => void;
}

/**
 * Componente PricingBreakdown para mostrar el desglose de precios
 */
export const PricingBreakdown: React.FC<PricingBreakdownProps> = ({
  adults,
  childrenCount,
  infantsCount = 0,
  subtotalAdults,
  subtotalChildren,
  total,
  currency,
  additionals,
  additionalsSubtotal,
  onRemoveAdditional,
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

      {infantsCount > 0 && (
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>
            Infantes: {infantsCount}
          </span>
          <span className={styles.summaryValue}>
            {formatPriceByCurrency(0, currency)}
          </span>
        </div>
      )}

      {additionals && additionals.length > 0 && (
        <>
          {additionals.map((additional) => (
            <div key={additional.additionalId} className={styles.summaryRow}>
              <span className={styles.summaryLabel}>
                {additional.name}
                {onRemoveAdditional && (
                  <button
                    type="button"
                    onClick={() => onRemoveAdditional(additional.additionalId)}
                    className={styles.removeAdditionalButton}
                    aria-label={`Eliminar ${additional.name}`}
                    title={`Eliminar ${additional.name}`}
                  >
                    <Icon name="close" size={16} />
                  </button>
                )}
              </span>
              <span className={styles.summaryValue}>
                {formatPriceByCurrency(
                  additional.priceAdult, // Precio único (no por pasajero)
                  additional.currency || currency
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

