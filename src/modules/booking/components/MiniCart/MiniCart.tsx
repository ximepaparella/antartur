"use client";

import React, { useState } from "react";
import type { PaymentMethod, Pricing, SelectedAdditional } from "@/lib/types/order";
import { useMiniCartPricing } from "./hooks/useMiniCartPricing";
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

  // Manejar cambio de método de pago
  const handlePaymentChange = (method: PaymentMethod) => {
    setSelectedPayment(method);
    onPaymentMethodChange(method);
  };

  // Determinar si mostrar blur en métodos de pago
  const showPaymentBlur = hasRestrictionViolations;

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
        showBlur={showPaymentBlur}
        exceedsAvailability={exceedsAvailability}
        hasRestrictionViolations={hasRestrictionViolations}
        onPaymentChange={handlePaymentChange}
      />

      <CheckoutButton
        exceedsAvailability={exceedsAvailability}
        hasRestrictionViolations={hasRestrictionViolations}
        hasValidationErrors={hasValidationErrors}
        selectedPayment={selectedPayment}
        onSubmit={onSubmit}
      />
    </div>
  );
};
