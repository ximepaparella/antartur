"use client";

import React from "react";
import { Button } from "@/components/common/Button/Button";
import type { PaymentMethod } from "@/lib/types/order";
import styles from "../MiniCart.module.scss";

interface CheckoutButtonProps {
  exceedsAvailability: boolean;
  hasRestrictionViolations: boolean;
  hasValidationErrors: boolean;
  isProcessing?: boolean;
  selectedPayment: PaymentMethod | undefined;
  forceEnquiryMode?: boolean;
  noMethodsAvailable?: boolean;
  onSubmit: (paymentMethod?: PaymentMethod) => void;
}

/**
 * Componente CheckoutButton para el botón de checkout con lógica condicional
 */
export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  exceedsAvailability,
  hasRestrictionViolations,
  hasValidationErrors,
  isProcessing = false,
  selectedPayment,
  forceEnquiryMode = false,
  noMethodsAvailable = false,
  onSubmit,
}) => {
  // Determinar el estado del checkout
  // Si no hay métodos de pago disponibles, también es modo consulta
  const hasProblems = exceedsAvailability || hasRestrictionViolations || forceEnquiryMode || noMethodsAvailable;
  const ctaText = hasProblems ? "ENVIAR CONSULTA" : "RESERVAR";
  
  // Botón deshabilitado si hay errores de validación o está procesando
  const isButtonDisabled = hasValidationErrors || isProcessing;

  const handleSubmit = () => {
    if (!isButtonDisabled) {
      // Si hay problemas o no hay método seleccionado, pasar undefined
      // Esto convertirá la reserva en consulta
      const paymentMethod: PaymentMethod | undefined = hasProblems || !selectedPayment
        ? undefined 
        : selectedPayment;
      onSubmit(paymentMethod);
    }
  };

  // Texto del botón según el estado
  const getButtonText = () => {
    if (isProcessing) {
      return (
        <span className={styles.buttonLoading}>
          <span className={styles.spinner} />
          Procesando...
        </span>
      );
    }
    return ctaText;
  };

  return (
    <Button
      variant="primary"
      onClick={handleSubmit}
      className={styles.submitButton}
      disabled={isButtonDisabled}
    >
      {getButtonText()}
    </Button>
  );
};

