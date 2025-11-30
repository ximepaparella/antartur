"use client";

import React from "react";
import type { PaymentMethod } from "@/lib/types/order";
import { getPaymentInfo } from "../utils/paymentUtils";
import styles from "../MiniCart.module.scss";

interface PaymentMethodInfoProps {
  paymentMethod: PaymentMethod;
}

/**
 * Componente PaymentMethodInfo para mostrar información del método de pago seleccionado
 */
export const PaymentMethodInfo: React.FC<PaymentMethodInfoProps> = ({
  paymentMethod,
}) => {
  const info = getPaymentInfo(paymentMethod);

  if (!info) {
    return null;
  }

  return (
    <div className={styles.paymentInfo}>
      <p>{info}</p>
    </div>
  );
};

