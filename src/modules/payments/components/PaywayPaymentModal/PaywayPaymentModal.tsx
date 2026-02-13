"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { PaywayCardForm } from "../PaywayCardForm";
import { formatPriceByCurrency } from "@/lib/utils/priceFormat";
import { Message } from "@/components/common/Message";
import styles from "./PaywayPaymentModal.module.scss";

const PAYWAY_PROCESS_TIMEOUT_MS = 10000;

interface PaywayPaymentModalProps {
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Callback cuando se cierra el modal */
  onClose: () => void;
  /** ID de la orden */
  orderId: string;
  /** Monto total a pagar */
  amount: number;
  /** Moneda */
  currency: string;
  /** Descripción de la orden */
  description?: string;
  /** Callback cuando el pago se procesa exitosamente */
  onPaymentSuccess: () => void;
  /** Callback cuando hay un error en el pago */
  onPaymentError?: (error: string) => void;
}

/**
 * Modal de pago con Payway
 * Integra el formulario de tarjeta y procesa el pago
 */
export const PaywayPaymentModal: React.FC<PaywayPaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  currency,
  description,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Al desmontar o cerrar el modal, abortar cualquier petición en vuelo
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleClose = useCallback(() => {
    if (isProcessing && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (isProcessing && !abortControllerRef.current) {
      return;
    }
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setError(null);
    }, 200);
  }, [isProcessing, onClose]);

  const handleTokenCreated = useCallback(
    async (tokenData: { token: string; bin: string; lastFourDigits: string }) => {
      setIsProcessing(true);
      setError(null);
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), PAYWAY_PROCESS_TIMEOUT_MS);

      try {
        const response = await fetch("/api/payments/payway/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            token: tokenData.token,
            bin: tokenData.bin,
            lastFourDigits: tokenData.lastFourDigits,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        abortControllerRef.current = null;

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error?.detail ||
            errorData.error?.title ||
            errorData.message ||
            `Error al procesar el pago: ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const result = await response.json();

        if (result.success && result.data?.status === "approved") {
          onPaymentSuccess();
        } else {
          const statusMessage =
            result.data?.status === "rejected"
              ? "El pago fue rechazado. Por favor, verifique los datos de su tarjeta."
              : result.data?.status === "pending"
              ? "El pago está pendiente de confirmación."
              : "El pago no pudo ser procesado.";
          throw new Error(statusMessage);
        }
      } catch (err) {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        clearTimeout(timeoutId);
        const errorMessage =
          err instanceof Error && err.name === "AbortError"
            ? "La solicitud tardó demasiado. Intentá de nuevo."
            : err instanceof Error
            ? err.message
            : "Error al procesar el pago. Por favor, intente nuevamente.";
        setError(errorMessage);
        onPaymentError?.(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [orderId, onPaymentSuccess, onPaymentError]
  );

  return (
    <Modal
      isOpen={isOpen}
      isClosing={isClosing}
      title="Pagar con Tarjeta"
      size="large"
      onClose={handleClose}
      closeOnOverlayClick={false}
    >
      <div className={styles.paymentModal}>
        {/* Resumen de la orden */}
        <div className={styles.orderSummary}>
          <div className={styles.orderInfo}>
            <p className={styles.orderId}>Orden: {orderId}</p>
            <p className={styles.orderAmount}>
              Total: {formatPriceByCurrency(amount, currency)}
            </p>
            {description && (
              <p className={styles.orderDescription}>{description}</p>
            )}
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className={styles.errorContainer}>
            <Message variant="alert">{error}</Message>
          </div>
        )}

        {/* Formulario de tarjeta */}
        <div className={styles.cardFormContainer}>
          <PaywayCardForm
            onTokenCreated={handleTokenCreated}
            onCancel={handleClose}
            disabled={isProcessing}
          />
        </div>

        {/* Información de seguridad */}
        <div className={styles.securityInfo}>
          <p className={styles.securityText}>
            Sus datos de tarjeta se procesan de forma segura. No almacenamos
            información de su tarjeta.
          </p>
        </div>
      </div>
    </Modal>
  );
};
