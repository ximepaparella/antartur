"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/common/Button/Button";
import { Card } from "@/components/common/Card";
import { Icon } from "@/components/icons/Icon";
import { Message } from "@/components/common/Message";
import { TourInfo } from "@/components/common/TourInfo";
import type { PaymentMethod } from "@/lib/types/order";
import styles from "./MiniCart.module.scss";

interface MiniCartProps {
  tourTitle: string;
  date: string;
  timeSlot: string;
  adults: number;
  childrenCount: number;
  pricing: {
    currency: "ARS" | "USD";
    priceAdult: number;
    priceChild: number;
  };
  exceedsAvailability: boolean;
  hasRestrictionViolations?: boolean;
  hasValidationErrors?: boolean;
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
  exceedsAvailability,
  hasRestrictionViolations = false,
  hasValidationErrors = false,
  onPaymentMethodChange,
  onSubmit,
}) => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("transferencia");

  const subtotalAdults = useMemo(() => {
    return adults * pricing.priceAdult;
  }, [adults, pricing.priceAdult]);

  const subtotalChildren = useMemo(() => {
    return childrenCount * pricing.priceChild;
  }, [childrenCount, pricing.priceChild]);

  const total = useMemo(() => {
    return subtotalAdults + subtotalChildren;
  }, [subtotalAdults, subtotalChildren]);

  const formatPrice = (amount: number): string => {
    if (pricing.currency === "ARS") {
      return `$${amount.toLocaleString("es-AR")}`;
    }
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  const handlePaymentChange = (method: PaymentMethod) => {
    setSelectedPayment(method);
    onPaymentMethodChange(method);
  };

  const hasProblems = exceedsAvailability || hasRestrictionViolations;
  const ctaText = hasProblems ? "CONSULTAR DISPONIBILIDAD" : "RESERVAR";
  const isButtonDisabled = hasRestrictionViolations;
  const showPaymentMethods = !exceedsAvailability || hasRestrictionViolations;
  const showPaymentBlur = hasRestrictionViolations;

  const getPaymentIcon = (method: PaymentMethod): "bank" | "wallet" | "credit-card" => {
    switch (method) {
      case "transferencia":
        return "bank";
      case "paypal":
        return "wallet";
      case "payway":
        return "credit-card";
      default:
        return "credit-card";
    }
  };

  const handleSubmit = () => {
    if (!isButtonDisabled) {
      // Si hay exceso de disponibilidad sin restricciones, pasar null (skip payment)
      // El tipo PaymentMethod permite undefined según order.ts
      const paymentMethod = exceedsAvailability && !hasRestrictionViolations 
        ? undefined 
        : selectedPayment;
      onSubmit(paymentMethod as PaymentMethod);
    }
  };

  return (
    <div className={styles.miniCart}>
      <Card title="Tu pedido">
        <div className={styles.orderSummary}>
        <TourInfo
          title={tourTitle}
          date={formatDate(date)}
          timeSlot={timeSlot}
          className={styles.tourInfo}
        />

        {adults > 0 && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>
              Adultos: {adults}
            </span>
            <span className={styles.summaryValue}>
              {formatPrice(subtotalAdults)}
            </span>
          </div>
        )}

        {childrenCount > 0 && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>
              Niños: {childrenCount}
            </span>
            <span className={styles.summaryValue}>
              {formatPrice(subtotalChildren)}
            </span>
          </div>
        )}

        <div className={styles.divider} />

        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Subtotal:</span>
          <span className={styles.summaryValue}>{formatPrice(total)}</span>
        </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabelTotal}>Total:</span>
            <span className={styles.summaryValueTotal}>{formatPrice(total)}</span>
          </div>
        </div>
      </Card>

      <Card title="Método de pago">
        {showPaymentMethods && (
          <div className={`${styles.paymentOptions} ${showPaymentBlur ? styles.blurred : ""}`}>
            <label className={styles.paymentOption}>
              <div className={styles.radioWrapper}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transferencia"
                  checked={selectedPayment === "transferencia"}
                  onChange={() => handlePaymentChange("transferencia")}
                  className={styles.radioInput}
                  disabled={showPaymentBlur}
                />
                <Icon name="bank" size={20} className={styles.paymentIcon} />
                <span className={styles.radioLabel}>Transferencia bancaria directa</span>
              </div>
              {selectedPayment === "transferencia" && !showPaymentBlur && (
                <div className={styles.paymentInfo}>
                  <p>
                    Realiza tu pago directamente en nuestra cuenta bancaria. Por favor, usa el número del pedido como referencia de pago. Tu pedido no se procesará hasta que se haya recibido el importe en nuestra cuenta.
                  </p>
                </div>
              )}
            </label>

            <label className={styles.paymentOption}>
              <div className={styles.radioWrapper}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={selectedPayment === "paypal"}
                  onChange={() => handlePaymentChange("paypal")}
                  className={styles.radioInput}
                  disabled={showPaymentBlur}
                />
                <Icon name="wallet" size={20} className={styles.paymentIcon} />
                <span className={styles.radioLabel}>PayPal</span>
              </div>
              {selectedPayment === "paypal" && !showPaymentBlur && (
                <div className={styles.paymentInfo}>
                  <p>
                    Pagar con PayPal; podés pagar con tu tarjeta de crédito si no tenés una cuenta de PayPal.
                  </p>
                </div>
              )}
            </label>

            <label className={styles.paymentOption}>
              <div className={styles.radioWrapper}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="payway"
                  checked={selectedPayment === "payway"}
                  onChange={() => handlePaymentChange("payway")}
                  className={styles.radioInput}
                  disabled={showPaymentBlur}
                />
                <Icon name="credit-card" size={20} className={styles.paymentIcon} />
                <span className={styles.radioLabel}>Payway Payment</span>
              </div>
              {selectedPayment === "payway" && !showPaymentBlur && (
                <div className={styles.paymentInfo}>
                  <p>
                    Pago seguro a través de Payway.
                  </p>
                </div>
              )}
            </label>
          </div>
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

      <Button
        variant="primary"
        onClick={handleSubmit}
        className={styles.submitButton}
        disabled={isButtonDisabled}
      >
        {ctaText}
      </Button>
    </div>
  );
};

