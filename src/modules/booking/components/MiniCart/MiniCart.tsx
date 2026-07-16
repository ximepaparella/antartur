"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { PaymentMethod, Pricing, SelectedAdditional } from "@/lib/types/order";
import { useMiniCartPricing } from "./hooks/useMiniCartPricing";
import { OrderSummary } from "./OrderSummary";
import { PaymentMethods } from "./PaymentMethods";
import { CheckoutButton } from "./CheckoutButton";
import type { AllPaymentMethods } from "@/modules/payments/api/server/paymentsServer";
import { isValidPaymentMethod } from "@/modules/payments/domain/constants";
import styles from "./MiniCart.module.scss";

interface MiniCartProps {
  tourTitle: string;
  date: string;
  timeSlot: string;
  adults: number;
  childrenCount: number;
  infantsCount?: number;
  pricing: Pricing;
  tourId?: string; // ID del tour para obtener pricing completo si es necesario
  exceedsAvailability: boolean;
  hasRestrictionViolations?: boolean;
  hasValidationErrors?: boolean;
  isProcessing?: boolean;
  additionals?: SelectedAdditional[];
  onRemoveAdditional?: (additionalId: string) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onSubmit: (paymentMethod?: PaymentMethod) => void;
  allPaymentMethods: AllPaymentMethods; // Métodos de pago pre-cargados desde el servidor
  onlineBookingsEnabled?: boolean;
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
  infantsCount = 0,
  pricing,
  tourId,
  exceedsAvailability,
  hasRestrictionViolations = false,
  hasValidationErrors = false,
  isProcessing = false,
  additionals = [],
  onRemoveAdditional,
  onPaymentMethodChange,
  onSubmit,
  allPaymentMethods,
  onlineBookingsEnabled = true,
}) => {
  // Estado del método de pago seleccionado (puede ser undefined si no hay métodos disponibles)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | undefined>(undefined);

  // Calcular precios usando hook
  const { subtotalAdults, subtotalChildren, additionalsSubtotal, total, currentPricing, normalizedAdditionals } = useMiniCartPricing({
    pricing,
    tourId,
    adults,
    childrenCount,
    additionals,
  });


  // Filtrar métodos de pago según la moneda actual (en memoria, sin fetch)
  const { availableMethods, isLoadingMethods, noMethodsAvailable } = useMemo(() => {
    if (!onlineBookingsEnabled) {
      return {
        availableMethods: [] as PaymentMethod[],
        isLoadingMethods: false,
        noMethodsAvailable: true,
      };
    }

    const currency = currentPricing.currencyCode as "ARS" | "USD";
    const methodsForCurrency = allPaymentMethods[currency] || [];
    
    // Convertir providers a PaymentMethod type usando validación centralizada
    const methods = methodsForCurrency
      .map((m) => m.provider)
      .filter((provider): provider is PaymentMethod => isValidPaymentMethod(provider));
    
    return {
      availableMethods: methods,
      isLoadingMethods: false, // Ya están cargados desde el servidor
      noMethodsAvailable: methods.length === 0,
    };
  }, [currentPricing.currencyCode, allPaymentMethods, onlineBookingsEnabled]);

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
  const forceEnquiryMode =
    !onlineBookingsEnabled ||
    (noMethodsAvailable && !exceedsAvailability && !hasRestrictionViolations);

  return (
    <div className={styles.miniCart}>
      <OrderSummary
        tourTitle={tourTitle}
        date={date}
        timeSlot={timeSlot}
        adults={adults}
        childrenCount={childrenCount}
        infantsCount={infantsCount}
        subtotalAdults={subtotalAdults}
        subtotalChildren={subtotalChildren}
        total={total}
        currency={currentPricing.currencyCode}
        additionals={normalizedAdditionals}
        additionalsSubtotal={additionalsSubtotal}
        onRemoveAdditional={onRemoveAdditional}
      />

      {onlineBookingsEnabled && (
        <PaymentMethods
          selectedPayment={selectedPayment}
          availableMethods={availableMethods}
          isLoading={isLoadingMethods}
          showBlur={showPaymentBlur}
          exceedsAvailability={exceedsAvailability}
          hasRestrictionViolations={hasRestrictionViolations}
          onPaymentChange={handlePaymentChange}
        />
      )}

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
