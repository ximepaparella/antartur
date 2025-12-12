"use client";

import React, { useState, useEffect } from "react";
import type { PaymentMethod, Pricing, SelectedAdditional } from "@/lib/types/order";
import { useMiniCartPricing } from "./hooks/useMiniCartPricing";
import { useAvailablePaymentMethods } from "@/modules/booking/hooks/useAvailablePaymentMethods";
import { OrderSummary } from "./OrderSummary";
import { PaymentMethods } from "./PaymentMethods";
import { CheckoutButton } from "./CheckoutButton";
import styles from "./MiniCart.module.scss";

interface MiniCartProps {
  tourTitle: string;
  date: string;
  timeSlot: string;
  adults: number;
  childrenCount: number;
  pricing: Pricing;
  tourId?: string; // ID del tour para obtener pricing completo si es necesario
  exceedsAvailability: boolean;
  hasRestrictionViolations?: boolean;
  hasValidationErrors?: boolean;
  isProcessing?: boolean;
  additionals?: SelectedAdditional[];
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onSubmit: (paymentMethod?: PaymentMethod) => void;
}

/**
 * Componente MiniCart para mostrar resumen de la reserva y opciones de pago
 */
export const MiniCart: React.FC<MiniCartProps> = ({
  tourTitle,
  date,
  timeSlot,
  adults,
  childrenCount,
  pricing,
  tourId,
  exceedsAvailability,
  hasRestrictionViolations = false,
  hasValidationErrors = false,
  isProcessing = false,
  additionals = [],
  onPaymentMethodChange,
  onSubmit,
}) => {
  // Estado del método de pago seleccionado (puede ser undefined si no hay métodos disponibles)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | undefined>(undefined);

  // Calcular precios usando hook
  const { subtotalAdults, subtotalChildren, additionalsSubtotal, total, currentPricing } = useMiniCartPricing({
    pricing,
    tourId,
    adults,
    childrenCount,
    additionals,
  });

  // Obtener métodos de pago disponibles (centralizado aquí, no en PaymentMethods)
  const { methods: availableMethods, isLoading: isLoadingMethods, noMethodsAvailable } = useAvailablePaymentMethods(
    currentPricing.currencyCode
  );

  // Sincronizar selectedPayment con los métodos disponibles
  useEffect(() => {
    if (!isLoadingMethods) {
      if (availableMethods.length > 0) {
        // Si hay métodos disponibles y no hay uno seleccionado, o el seleccionado no es válido
        if (!selectedPayment || !availableMethods.includes(selectedPayment)) {
          setSelectedPayment(availableMethods[0]);
          onPaymentMethodChange(availableMethods[0]);
        }
      } else {
        // Si no hay métodos disponibles, limpiar la selección
        setSelectedPayment(undefined);
      }
    }
  }, [availableMethods, isLoadingMethods, selectedPayment, onPaymentMethodChange]);

  // Manejar cambio de método de pago
  const handlePaymentChange = (method: PaymentMethod) => {
    setSelectedPayment(method);
    onPaymentMethodChange(method);
  };

  // Determinar si mostrar blur en métodos de pago
  const showPaymentBlur = hasRestrictionViolations;

  // Determinar si forzar modo consulta (sin métodos de pago disponibles)
  const forceEnquiryMode = noMethodsAvailable && !exceedsAvailability && !hasRestrictionViolations;

  return (
    <div className={styles.miniCart}>
      <OrderSummary
        tourTitle={tourTitle}
        date={date}
        timeSlot={timeSlot}
        adults={adults}
        childrenCount={childrenCount}
        subtotalAdults={subtotalAdults}
        subtotalChildren={subtotalChildren}
        total={total}
        currency={currentPricing.currencyCode}
        additionals={additionals}
        additionalsSubtotal={additionalsSubtotal}
      />

      <PaymentMethods
        selectedPayment={selectedPayment}
        availableMethods={availableMethods}
        isLoading={isLoadingMethods}
        showBlur={showPaymentBlur}
        exceedsAvailability={exceedsAvailability}
        hasRestrictionViolations={hasRestrictionViolations}
        onPaymentChange={handlePaymentChange}
      />

      <CheckoutButton
        exceedsAvailability={exceedsAvailability}
        hasRestrictionViolations={hasRestrictionViolations}
        hasValidationErrors={hasValidationErrors}
        isProcessing={isProcessing}
        selectedPayment={selectedPayment}
        forceEnquiryMode={forceEnquiryMode}
        noMethodsAvailable={noMethodsAvailable}
        onSubmit={onSubmit}
      />
    </div>
  );
};
