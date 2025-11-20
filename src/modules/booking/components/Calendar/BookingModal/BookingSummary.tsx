"use client";

import React from "react";
import { Icon } from "@/components/icons/Icon";
import { formatPriceByCurrency } from "@/lib/utils/priceFormat";
import { Message } from "@/components/common/Message";
import styles from "../Calendar.module.scss";

interface BookingSummaryProps {
  subtotal: number;
  exceedsAvailability: boolean;
  currency: string;
}

/**
 * Componente BookingSummary para mostrar el resumen de la reserva
 */
export const BookingSummary: React.FC<BookingSummaryProps> = ({
  subtotal,
  exceedsAvailability,
  currency,
}) => {
  return (
    <>
      {exceedsAvailability && (
        <Message variant="warning">
          <p>
            La cantidad de pasajeros supera la disponibilidad. Puede continuar y enviar una consulta de disponibilidad a nuestro equipo.
          </p>
        </Message>
      )}

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

