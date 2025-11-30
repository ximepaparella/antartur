"use client";

import React from "react";
import { Icon } from "@/components/icons/Icon";
import { formatPriceByCurrency } from "@/lib/utils/priceFormat";
import { Message } from "@/components/common/Message";
import styles from "../Calendar.module.scss";

interface BookingSummaryProps {
  subtotal: number;
  currency: string;
}

/**
 * Componente BookingSummary para mostrar el resumen de la reserva
 */
export const BookingSummary: React.FC<BookingSummaryProps> = ({
  subtotal,
  currency,
}) => {
  return (
    <>
      <div className={styles.disclaimer}>
        <Icon name="info" size={16} />
        <p>La información de los pasajeros se solicitará en el siguiente paso.</p>
      </div>

      <div className={styles.subtotalSection}>
        <p className={styles.subtotalLabel}>Subtotal:</p>
        <p className={styles.subtotalAmount}>{formatPriceByCurrency(subtotal, currency)}</p>
      </div>
    </>
  );
};

