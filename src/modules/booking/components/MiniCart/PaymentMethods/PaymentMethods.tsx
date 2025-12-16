"use client";

import React from "react";
import { Card } from "@/components/common/Card";
import { Message } from "@/components/common/Message";
import type { PaymentMethod } from "@/lib/types/order";
import { PaymentMethodOption } from "./PaymentMethodOption";
import styles from "../MiniCart.module.scss";

interface PaymentMethodsProps {
  selectedPayment: PaymentMethod | undefined;
  availableMethods: PaymentMethod[];
  isLoading: boolean;
  showBlur: boolean;
  exceedsAvailability: boolean;
  hasRestrictionViolations: boolean;
  onPaymentChange: (method: PaymentMethod) => void;
}

/**
 * Componente PaymentMethods para mostrar opciones de pago y mensajes de estado
 * Recibe los métodos disponibles como prop (calculados en MiniCart)
 */
export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  selectedPayment,
  availableMethods,
  isLoading,
  showBlur,
  exceedsAvailability,
  hasRestrictionViolations,
  onPaymentChange,
}) => {
  // La sincronización del método seleccionado se hace en MiniCart

  const showPaymentMethods = !exceedsAvailability && !hasRestrictionViolations;
  const noPaymentMethodsAvailable = !isLoading && availableMethods.length === 0;

  return (
    <Card title="Método de pago">
      {/* Loading state */}
      {isLoading && showPaymentMethods && (
        <div className={styles.paymentOptions}>
          <div className={styles.skeletonPaymentOption} />
          <div className={styles.skeletonPaymentOption} />
        </div>
      )}

      {/* Payment methods */}
      {!isLoading && showPaymentMethods && availableMethods.length > 0 && (
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

      {/* No payment methods available - will be an enquiry */}
      {!isLoading && showPaymentMethods && noPaymentMethodsAvailable && (
        <Message variant="info">
          <p>
            No hay métodos de pago disponibles en este momento. Tu solicitud será procesada como una consulta y nuestro equipo se pondrá en contacto contigo para coordinar el pago.
          </p>
        </Message>
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
