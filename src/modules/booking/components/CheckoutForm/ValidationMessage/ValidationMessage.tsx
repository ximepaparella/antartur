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
    // NO hacer scroll/focus si el usuario está activamente editando
    if (isUserEditingRef.current) {
      return;
    }

    // Solo hacer scroll si:
    // 1. Cambió de false a true (errores aparecieron)
    // 2. El usuario NO está activamente editando
    // 3. Pasó suficiente tiempo desde la última edición (5 segundos para estar seguro)
    const timeSinceLastEdit = Date.now() - lastEditTimeRef.current;
    const shouldScroll =
      hasValidationErrors &&
      !prevHasValidationErrorsRef.current &&
      validationMessageRef.current &&
      timeSinceLastEdit > 5000; // Aumentado a 5 segundos para dar más tiempo al usuario

    if (shouldScroll) {
      // Solo hacer scroll, NO hacer focus para no sacar al usuario del campo
      validationMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      // NO hacer focus aquí - solo scroll
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

