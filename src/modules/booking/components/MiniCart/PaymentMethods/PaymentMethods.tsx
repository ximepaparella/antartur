"use client";

import React, { useMemo } from "react";
import { Card } from "@/components/common/Card";
import { Message } from "@/components/common/Message";
import type { PaymentMethod } from "@/lib/types/order";
import { getAvailablePaymentMethods } from "../utils/paymentUtils";
import { PaymentMethodOption } from "./PaymentMethodOption";
import styles from "../MiniCart.module.scss";

interface PaymentMethodsProps {
  selectedPayment: PaymentMethod;
  currencyCode: string;
  showBlur: boolean;
  exceedsAvailability: boolean;
  hasRestrictionViolations: boolean;
  onPaymentChange: (method: PaymentMethod) => void;
}

/**
 * Componente PaymentMethods para mostrar opciones de pago y mensajes de estado
 */
export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  selectedPayment,
  currencyCode,
  showBlur,
  exceedsAvailability,
  hasRestrictionViolations,
  onPaymentChange,
}) => {
  // Filtrar métodos de pago según currency
  const availableMethods = useMemo(() => {
    return getAvailablePaymentMethods(currencyCode);
  }, [currencyCode]);

  // Si el método seleccionado no está disponible, seleccionar el primero disponible
  React.useEffect(() => {
    if (!availableMethods.includes(selectedPayment) && availableMethods.length > 0) {
      onPaymentChange(availableMethods[0]);
    }
  }, [availableMethods, selectedPayment, onPaymentChange]);

  const showPaymentMethods = !exceedsAvailability && !hasRestrictionViolations;

  return (
    <Card title="Método de pago">
      {showPaymentMethods && (
        <div className={`${styles.paymentOptions} ${showBlur ? styles.blurred : ""}`}>
          {availableMethods.map((method) => (
            <PaymentMethodOption
              key={method}
              method={method}
              selected={selectedPayment === method}
              disabled={showBlur}
              onSelect={onPaymentChange}
            />
          ))}
        </div>
      )}

      {/* Disclaimer siempre visible donde estarían los métodos de pago */}
      {exceedsAvailability && !hasRestrictionViolations && (
        <Message variant="warning">
          <p>
            La cantidad de pasajeros supera la disponibilidad. Se consultará la disponibilidad con nuestro equipo. En caso de poder coordinar, se abonará luego.
          </p>
        </Message>
      )}

      {hasRestrictionViolations && (
        <Message variant="alert">
          <p>
            Algunos pasajeros no cumplen con las restricciones del tour. No es posible realizar el pago. Esta será una consulta y nuestro equipo se contactará contigo.
          </p>
        </Message>
      )}
    </Card>
  );
};

