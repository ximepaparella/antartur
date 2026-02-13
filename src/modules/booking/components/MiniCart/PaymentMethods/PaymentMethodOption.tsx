"use client";

import React from "react";
import { Icon } from "@/components/icons/Icon";
import type { PaymentMethod } from "@/lib/types/order";
import { getPaymentIcon } from "../utils/paymentUtils";
import { PaymentMethodInfo } from "./PaymentMethodInfo";
import styles from "../MiniCart.module.scss";

interface PaymentMethodOptionProps {
  method: PaymentMethod;
  selected: boolean;
  disabled?: boolean;
  onSelect: (method: PaymentMethod) => void;
}

/**
 * Componente PaymentMethodOption para renderizar una opción de método de pago
 */
export const PaymentMethodOption: React.FC<PaymentMethodOptionProps> = ({
  method,
  selected,
  disabled = false,
  onSelect,
}) => {
  const icon = getPaymentIcon(method);
  
  // Labels para cada método de pago
  const getMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case "transferencia":
        return "Transferencia bancaria directa";
      case "paypal":
        return "PayPal";
      case "payway":
        return "Pagar con Payway";
      default:
        return method;
    }
  };

  return (
    <label className={styles.paymentOption}>
      <div className={styles.radioWrapper}>
        <input
          type="radio"
          name="paymentMethod"
          value={method}
          checked={selected}
          onChange={() => onSelect(method)}
          className={styles.radioInput}
          disabled={disabled}
        />
        <Icon name={icon} size={20} className={styles.paymentIcon} />
        <span className={styles.radioLabel}>{getMethodLabel(method)}</span>
      </div>
      {selected && !disabled && <PaymentMethodInfo paymentMethod={method} />}
    </label>
  );
};

