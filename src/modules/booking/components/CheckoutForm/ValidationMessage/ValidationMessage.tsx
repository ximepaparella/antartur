"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "@/components/common/Message";
import styles from "../CheckoutForm.module.scss";

interface ValidationMessageProps {
  hasValidationErrors: boolean;
  /** Ref para rastrear si el usuario está activamente editando campos */
  isUserEditingRef: React.MutableRefObject<boolean>;
  /** Ref para rastrear el último momento en que el usuario editó un campo */
  lastEditTimeRef: React.MutableRefObject<number>;
}

/**
 * Componente ValidationMessage para mostrar mensaje de validación general
 * con gestión automática de scroll cuando aparecen errores
 */
export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  hasValidationErrors,
  isUserEditingRef,
  lastEditTimeRef,
}) => {
  const validationMessageRef = useRef<HTMLDivElement>(null);
  const prevHasValidationErrorsRef = useRef<boolean>(false);

  // Hacer focus en el mensaje de validación solo cuando aparezcan errores por primera vez
  // Y solo si el usuario NO está activamente editando campos
  useEffect(() => {
    // Solo hacer scroll si:
    // 1. Cambió de false a true (errores aparecieron)
    // 2. El usuario NO está activamente editando (o pasó suficiente tiempo desde la última edición)
    const timeSinceLastEdit = Date.now() - lastEditTimeRef.current;
    const shouldScroll =
      hasValidationErrors &&
      !prevHasValidationErrorsRef.current &&
      validationMessageRef.current &&
      (!isUserEditingRef.current || timeSinceLastEdit > 2000);

    if (shouldScroll) {
      validationMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      validationMessageRef.current.focus();
    }
    // Actualizar el ref con el valor actual
    prevHasValidationErrorsRef.current = hasValidationErrors;
  }, [hasValidationErrors, isUserEditingRef, lastEditTimeRef]);

  if (!hasValidationErrors) {
    return null;
  }

  return (
    <div
      ref={validationMessageRef}
      tabIndex={-1}
      className={styles.validationMessage}
    >
      <Message variant="alert">
        <p>
          Por favor, completa todos los campos requeridos antes de continuar.
        </p>
      </Message>
    </div>
  );
};

