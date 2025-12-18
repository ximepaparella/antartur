"use client";

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useRef } from "react";
import { getPendingBooking } from "@/lib/utils/orderStorage";
import type { Order, PaymentMethod } from "@/lib/types/order";
import { useCheckoutState } from "./hooks/useCheckoutState";
import { useCheckoutInitialization } from "./hooks/useCheckoutInitialization";
import { useOrderSubmission } from "./hooks/useOrderSubmission";
import { ValidationMessage } from "./ValidationMessage";
import { BillingInfoForm } from "./BillingInfoForm";
import { PassengersSection } from "./PassengersSection";
import { AdditionalInfoForm } from "./AdditionalInfoForm";
import { RemovePassengerModal } from "./RemovePassengerModal";
import styles from "./CheckoutForm.module.scss";

interface CheckoutFormProps {
  /** Si el tour tiene restricciones para embarazadas */
  hasPregnancyRestriction?: boolean;
  /** Si el tour tiene restricciones para problemas de columna/salud */
  hasHealthRestriction?: boolean;
  /** Edad mínima requerida para el tour */
  minAge?: number | null;
  /** Si el tour acepta infantes (0-3 años) */
  allowsInfants?: boolean;
  /** Callback cuando se completa el checkout */
  onCheckoutComplete: (order: Order) => void;
  /** Callback cuando cambia el estado de violaciones de restricciones */
  onRestrictionViolationsChange?: (hasViolations: boolean) => void;
  /** Callback cuando cambia el número de pasajeros */
  onPassengersChange?: (adults: number, children: number) => void;
  /** Callback cuando cambia el estado de errores de validación */
  onValidationErrorsChange?: (hasErrors: boolean) => void;
  /** Callback cuando cambia el estado de envío del formulario */
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

export interface CheckoutFormRef {
  submit: (paymentMethod?: PaymentMethod) => void;
  hasRestrictionViolations: boolean;
  hasValidationErrors: boolean;
  isSubmitting: boolean;
}

/**
 * Componente principal del formulario de checkout
 */
export const CheckoutForm = forwardRef<CheckoutFormRef, CheckoutFormProps>(({
  hasPregnancyRestriction = false,
  hasHealthRestriction = false,
  minAge,
  allowsInfants = false,
  onCheckoutComplete,
  onRestrictionViolationsChange,
  onPassengersChange,
  onValidationErrorsChange,
  onSubmittingChange,
}, ref) => {
  const [passengerToRemove, setPassengerToRemove] = useState<number | null>(null);
  const [isClosingModal, setIsClosingModal] = useState(false);
  
  // Ref para rastrear la última cantidad de pasajeros procesada
  const lastPassengersCountRef = useRef<{ adults: number; children: number } | null>(null);
  
  // Ref para rastrear si el usuario está activamente editando campos
  const isUserEditingRef = useRef<boolean>(false);
  // Ref para rastrear el último momento en que el usuario editó un campo
  const lastEditTimeRef = useRef<number>(0);
  // Ref para rastrear la última cantidad de pasajeros (para detectar cuando se agregan nuevos)
  const lastPassengerCountRef = useRef<number>(0);

  // Inicialización desde localStorage
  const { bookingData, initialPassengers, initialBillingInfo, isLoading } = useCheckoutInitialization();

  // Estado del formulario
  const {
    passengers,
    billingInfo,
    errors,
    hasValidationErrors,
    hasRestrictionViolations,
    isValid,
    updateBillingInfo,
    replacePassenger,
    markFieldAsTouched,
    addPassenger,
    removePassenger,
    validateBilling,
    validatePassenger,
    validateAllFields,
  } = useCheckoutState({
    initialPassengers,
    initialBillingInfo,
    hasPregnancyRestriction,
    hasHealthRestriction,
    onPassengersChange,
  });

  // Order submission hook
  const { submitOrder, isSubmitting } = useOrderSubmission({
    onCheckoutComplete,
  });
  
  // Notificar cambios en el estado de envío
  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  // Actualizar bookingData cuando cambian los pasajeros
  // Esto asegura que exceedsAvailability se actualice cuando se agregan/quitan pasajeros
  useEffect(() => {
    const currentAdults = passengers.filter((p) => p.esAdulto).length;
    const currentChildren = passengers.filter((p) => !p.esAdulto).length;
    
    const lastCount = lastPassengersCountRef.current;
    // Solo actualizar si la cantidad de pasajeros realmente cambió
    if (
      !lastCount ||
      lastCount.adults !== currentAdults ||
      lastCount.children !== currentChildren
    ) {
      lastPassengersCountRef.current = { adults: currentAdults, children: currentChildren };
      
      // Pequeño delay para asegurar que updatePendingBookingPassengers haya terminado
      setTimeout(() => {
        // Recargar bookingData desde localStorage (ya debería estar actualizado por updatePendingBookingPassengers)
        const updated = getPendingBooking();
        // Note: bookingData viene de useCheckoutInitialization, pero necesitamos actualizarlo aquí
        // Esto se manejará mejor cuando tengamos API, por ahora mantenemos la lógica
      }, 0);
    }
  }, [passengers.length, passengers]);

  // Notificar cambios en violaciones de restricciones
  useEffect(() => {
    if (onRestrictionViolationsChange) {
      onRestrictionViolationsChange(hasRestrictionViolations);
    }
  }, [hasRestrictionViolations, onRestrictionViolationsChange]);

  // Notificar cambios en errores de validación
  useEffect(() => {
    if (onValidationErrorsChange) {
      onValidationErrorsChange(hasValidationErrors);
    }
  }, [hasValidationErrors, onValidationErrorsChange]);

  // Marcar que el usuario está editando cuando cambian los pasajeros o billing info
  useEffect(() => {
    const currentPassengerCount = passengers.length;
    const passengerCountChanged = currentPassengerCount !== lastPassengerCountRef.current;
    
    // Si cambió la cantidad de pasajeros, puede ser que se agregó uno nuevo
    // En ese caso, marcar como "editando" pero con un delay más largo para evitar scroll inmediato
    if (passengerCountChanged) {
      lastPassengerCountRef.current = currentPassengerCount;
      // Cuando se agrega un pasajero nuevo, dar más tiempo antes de permitir scroll
      isUserEditingRef.current = true;
      lastEditTimeRef.current = Date.now();
      
      // Resetear el flag después de un delay más largo (5 segundos) cuando se agregan pasajeros
      const timeoutId = setTimeout(() => {
        isUserEditingRef.current = false;
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Si solo cambió el contenido (no la cantidad), el usuario está editando activamente
      isUserEditingRef.current = true;
      lastEditTimeRef.current = Date.now();
      
      // Resetear el flag después de un delay más largo (3 segundos sin cambios) para dar más tiempo al usuario
      const timeoutId = setTimeout(() => {
        isUserEditingRef.current = false;
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [passengers, billingInfo]);

  // Manejar submit
  const handleSubmit = useCallback(
    async (selectedPaymentMethod?: PaymentMethod) => {
      // Leer siempre la versión más reciente de la reserva pendiente
      const pending = getPendingBooking();
      const data = pending ?? bookingData;
      
      if (!data) return;
      
      if (!validateAllFields()) {
        return;
      }

      try {
        await submitOrder({
          bookingData: data,
          passengers,
          billingInfo,
          paymentMethod: selectedPaymentMethod,
          hasRestrictionViolations,
        });
      } catch (error) {
        // Error ya está manejado en useOrderSubmission
        console.error("Error al enviar orden:", error);
      }
    },
    [bookingData, passengers, billingInfo, hasRestrictionViolations, validateAllFields, submitOrder]
  );

  // Manejar eliminación de pasajero
  const handleRemovePassenger = useCallback(() => {
    if (passengerToRemove !== null) {
      const indexToRemove = passengerToRemove;
      const wasLastPassenger = indexToRemove === passengers.length - 1;
      removePassenger(indexToRemove);
      
      // Hacer scroll al pasajero que quedó en la posición del eliminado (o al anterior si era el último)
      // Usar setTimeout para esperar a que React actualice el DOM
      setTimeout(() => {
        // Si era el último pasajero, hacer scroll al nuevo último
        // Si no, hacer scroll al que quedó en esa posición
        const scrollToIndex = wasLastPassenger 
          ? Math.max(0, passengers.length - 2) // El nuevo último (o 0 si solo quedaba uno)
          : Math.min(indexToRemove, passengers.length - 2); // El que quedó en esa posición
        
        // Buscar el elemento del pasajero en el DOM usando el atributo data-passenger-index
        const passengerElement = document.querySelector(
          `[data-passenger-index="${scrollToIndex}"]`
        );
        if (passengerElement) {
          passengerElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 150);
    }
    setIsClosingModal(true);
    setTimeout(() => {
      setPassengerToRemove(null);
      setIsClosingModal(false);
    }, 200);
  }, [passengerToRemove, removePassenger, passengers]);

  // Manejar cierre del modal
  const handleCloseModal = useCallback(() => {
    setIsClosingModal(true);
    setTimeout(() => {
      setPassengerToRemove(null);
      setIsClosingModal(false);
    }, 200);
  }, []);

  // Exponer función de submit y estado mediante ref
  useImperativeHandle(
    ref,
    () => ({
      submit: handleSubmit,
      hasRestrictionViolations,
      hasValidationErrors,
      isSubmitting,
    }),
    [hasRestrictionViolations, handleSubmit, hasValidationErrors, isSubmitting]
  );

  if (isLoading || !bookingData || initialPassengers.length === 0) {
    return (
      <div className={styles.loading}>
        <p>Cargando información de la reserva...</p>
      </div>
    );
  }

  return (
    <div className={styles.checkoutForm}>
      <ValidationMessage
        hasValidationErrors={hasValidationErrors}
        isUserEditingRef={isUserEditingRef}
        lastEditTimeRef={lastEditTimeRef}
      />

      <BillingInfoForm
        billingInfo={billingInfo}
        errors={errors}
        onBillingInfoChange={updateBillingInfo}
        onValidateField={validateBilling}
      />

      <PassengersSection
        passengers={passengers}
        errors={errors}
        hasPregnancyRestriction={hasPregnancyRestriction}
        hasHealthRestriction={hasHealthRestriction}
        minAge={minAge}
        allowsInfants={
          // No permitir infantes si la edad mínima es mayor a 3 años
          (minAge && minAge > 3) 
            ? false 
            : (allowsInfants || bookingData?.pricing?.priceInfantFree === true)
        }
        infantMaxAge={bookingData?.pricing?.infantMaxAge}
        onPassengerChange={replacePassenger}
        onPassengerValidate={validatePassenger}
        onMarkFieldAsTouched={markFieldAsTouched}
        onAddPassenger={addPassenger}
        onPassengerRemove={setPassengerToRemove}
      />

      <AdditionalInfoForm
        billingInfo={billingInfo}
        onBillingInfoChange={updateBillingInfo}
      />

      <RemovePassengerModal
        isOpen={passengerToRemove !== null}
        isClosing={isClosingModal}
        onClose={handleCloseModal}
        onConfirm={handleRemovePassenger}
      />
    </div>
  );
});

CheckoutForm.displayName = "CheckoutForm";
