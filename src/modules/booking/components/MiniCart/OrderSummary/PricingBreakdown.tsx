"use client";

import React from "react";
import { formatPrice } from "@/lib/utils/priceFormat";
import styles from "../MiniCart.module.scss";

interface PricingBreakdownProps {
  adults: number;
  childrenCount: number;
  subtotalAdults: number;
  subtotalChildren: number;
  total: number;
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
}) => {
  return (
    <>
      {adults > 0 && (
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>
            Adultos: {adults}
          </span>
          <span className={styles.summaryValue}>
            {formatPrice(subtotalAdults)}
          </span>
        </div>
      )}

      {childrenCount > 0 && (
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>
            Niños: {childrenCount}
          </span>
          <span className={styles.summaryValue}>
            {formatPrice(subtotalChildren)}
          </span>
        </div>
      )}

      <div className={styles.divider} />

      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Subtotal:</span>
        <span className={styles.summaryValue}>{formatPrice(total)}</span>
      </div>

      <div className={styles.summaryRow}>
        <span className={styles.summaryLabelTotal}>Total:</span>
        <span className={styles.summaryValueTotal}>{formatPrice(total)}</span>
      </div>
    </>
  );
};

