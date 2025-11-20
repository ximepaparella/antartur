"use client";

import React from "react";
import { Button } from "@/components/common/Button/Button";
import type { PaymentMethod } from "@/lib/types/order";
import styles from "../MiniCart.module.scss";

interface CheckoutButtonProps {
  exceedsAvailability: boolean;
  hasRestrictionViolations: boolean;
  hasValidationErrors: boolean;
  selectedPayment: PaymentMethod;
  onSubmit: (paymentMethod?: PaymentMethod) => void;
}

/**
 * Componente CheckoutButton para el botón de checkout con lógica condicional
 */
export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  exceedsAvailability,
  hasRestrictionViolations,
  hasValidationErrors,
  selectedPayment,
  onSubmit,
}) => {
  // Determinar el estado del checkout
  const hasProblems = exceedsAvailability || hasRestrictionViolations;
  const ctaText = hasProblems ? "CONSULTAR DISPONIBILIDAD" : "RESERVAR";
  
  // Botón deshabilitado solo si hay errores de validación (permite consulta flow)
  const isButtonDisabled = hasValidationErrors;

  const handleSubmit = () => {
    if (!isButtonDisabled) {
      // Si hay exceso de disponibilidad sin restricciones, pasar undefined (skip payment)
      // El tipo PaymentMethod permite undefined según order.ts
      const paymentMethod: PaymentMethod | undefined = exceedsAvailability && !hasRestrictionViolations 
        ? undefined 
        : selectedPayment;
      onSubmit(paymentMethod);
    }
  };

  return (
    <Button
      variant="primary"
      onClick={handleSubmit}
      className={styles.submitButton}
      disabled={isButtonDisabled}
    >
      {ctaText}
    </Button>
  );
};

