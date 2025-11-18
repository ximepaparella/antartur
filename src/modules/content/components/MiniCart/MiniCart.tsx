"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/common/Button/Button";
import { Card } from "@/components/common/Card";
import { Icon } from "@/components/icons/Icon";
import { Message } from "@/components/common/Message";
import { TourInfo } from "@/components/common/TourInfo";
import { useCurrency, type Currency } from "@/contexts/CurrencyContext";
import { formatPrice, getPriceByCurrency } from "@/lib/utils/priceFormat";
import { getFullTourById } from "@/modules/content/components/ToursGrid/tourFullData";
import type { PaymentMethod, Pricing } from "@/lib/types/order";
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
  onPaymentMethodChange,
  onSubmit,
}) => {
  const { currency } = useCurrency();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("transferencia");
  
  // Función helper para obtener el pricing completo y actualizado
  const getFullPricing = useCallback((currentCurrency: Currency): Pricing => {
    // Siempre intentar obtener pricing completo del tour si tenemos tourId
    let fullPricing = pricing;
    if (tourId) {
      const tour = getFullTourById(tourId);
      if (tour?.booking?.pricing) {
        fullPricing = tour.booking.pricing;
      }
    }
    
    // IMPORTANTE: priceAdult y priceChild deben SIEMPRE ser valores en ARS
    // No los modificamos nunca - solo actualizamos el campo currency para metadata
    // Los valores USD están en priceAdultUSD y priceChildUSD
    return {
      ...fullPricing, // Mantener TODOS los valores originales (ARS y USD)
      currency: currentCurrency, // Solo actualizar metadata de moneda actual
      // NO modificar priceAdult ni priceChild - deben permanecer como ARS
    };
  }, [pricing, tourId]);

  const [currentPricing, setCurrentPricing] = useState<Pricing>(() => getFullPricing(currency));

  // Actualizar precios cuando cambia la moneda desde el contexto
  useEffect(() => {
    const newPricing = getFullPricing(currency);
    setCurrentPricing(newPricing);
    
    // Resetear método de pago si cambia la moneda
    if (currency === "USD") {
      setSelectedPayment("paypal");
    } else {
      setSelectedPayment("transferencia");
    }
  }, [currency, getFullPricing]);

  // Escuchar cambios de moneda desde el evento personalizado (para actualización inmediata)
  useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent<Currency>) => {
      const newCurrency = event.detail;
      const newPricing = getFullPricing(newCurrency);
      setCurrentPricing(newPricing);
      
      if (newCurrency === "USD") {
        setSelectedPayment("paypal");
      } else {
        setSelectedPayment("transferencia");
      }
    };

    window.addEventListener("currencyChanged", handleCurrencyChange as EventListener);
    return () => {
      window.removeEventListener("currencyChanged", handleCurrencyChange as EventListener);
    };
  }, [getFullPricing]);

  // Obtener precios según la moneda actual para cálculos y display
  const displayPrices = useMemo(() => {
    return getPriceByCurrency(currentPricing, currency);
  }, [currentPricing, currency]);

  const subtotalAdults = useMemo(() => {
    return adults * displayPrices.priceAdult;
  }, [adults, displayPrices.priceAdult]);

  const subtotalChildren = useMemo(() => {
    return childrenCount * displayPrices.priceChild;
  }, [childrenCount, displayPrices.priceChild]);

  const total = useMemo(() => {
    return subtotalAdults + subtotalChildren;
  }, [subtotalAdults, subtotalChildren]);

  const formatDate = (dateStr: string): string => {
    // Parsear como fecha local para evitar problemas de timezone
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
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

  // Determinar el estado del checkout
  const hasProblems = exceedsAvailability || hasRestrictionViolations;
  const ctaText = hasProblems ? "CONSULTAR DISPONIBILIDAD" : "RESERVAR";
  
  // Botón deshabilitado solo si hay errores de validación (permite consulta flow)
  const isButtonDisabled = hasValidationErrors;
  
  // Mostrar métodos de pago solo si no hay problemas (ni exceso de disponibilidad ni restricciones)
  const showPaymentMethods = !exceedsAvailability && !hasRestrictionViolations;
  
  // Blur en métodos de pago si hay restricciones violadas
  const showPaymentBlur = hasRestrictionViolations;

  // Métodos de pago disponibles según la moneda
  const availablePaymentMethods: PaymentMethod[] = 
    currency === "USD" 
      ? ["paypal"] 
      : ["transferencia", "payway"];

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
      // Si hay exceso de disponibilidad sin restricciones, pasar undefined (skip payment)
      // El tipo PaymentMethod permite undefined según order.ts
      const paymentMethod: PaymentMethod | undefined = exceedsAvailability && !hasRestrictionViolations 
        ? undefined 
        : selectedPayment;
      onSubmit(paymentMethod);
    }
  };

  return (
    <div className={styles.miniCart}>
      <Card title="Resumen de la reserva">
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
              {formatPrice(subtotalAdults, currency)}
            </span>
          </div>
        )}

        {childrenCount > 0 && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>
              Niños: {childrenCount}
            </span>
            <span className={styles.summaryValue}>
              {formatPrice(subtotalChildren, currency)}
            </span>
          </div>
        )}

        <div className={styles.divider} />

        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Subtotal:</span>
          <span className={styles.summaryValue}>{formatPrice(total, currency)}</span>
        </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabelTotal}>Total:</span>
            <span className={styles.summaryValueTotal}>{formatPrice(total, currency)}</span>
          </div>
        </div>
      </Card>

      <Card title="Método de pago">
        {showPaymentMethods && (
          <div className={`${styles.paymentOptions} ${showPaymentBlur ? styles.blurred : ""}`}>
            {availablePaymentMethods.includes("transferencia") && (
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
            )}

            {availablePaymentMethods.includes("paypal") && (
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
            )}

            {availablePaymentMethods.includes("payway") && (
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
            )}
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

