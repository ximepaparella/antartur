"use client";

import React, { useState } from "react";
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
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("transferencia");

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
        onSubmit={onSubmit}
      />
    </div>
  );
};
