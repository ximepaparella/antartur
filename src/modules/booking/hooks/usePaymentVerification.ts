/**
 * Hook para verificar el estado de un pago después del retorno del gateway
 * Reutilizable para PayPal y Payway
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/services/logger";

export interface UsePaymentVerificationOptions {
  orderCode?: string;
  orderId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  maxRetries?: number;
  retryDelay?: number;
  enabled?: boolean; // Si es false, no ejecuta la verificación automáticamente
}

export interface UsePaymentVerificationReturn {
  status: "loading" | "success" | "error";
  errorMessage: string | null;
  verifyPayment: () => Promise<void>;
}

/**
 * Hook para verificar el estado de un pago después del retorno del gateway
 */
export function usePaymentVerification(
  options: UsePaymentVerificationOptions = {}
): UsePaymentVerificationReturn {
  const router = useRouter();
  const {
    orderCode,
    orderId,
    onSuccess,
    onError,
    maxRetries = 3,
    retryDelay = 3000,
    enabled = true,
  } = options;

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const verifyPayment = useCallback(async () => {
    if (!orderCode && !orderId) {
      setStatus("error");
      setErrorMessage("No se proporcionó código de orden ni ID");
      return;
    }

    try {
      // Usar el endpoint correcto según si tenemos code o id
      // Validar que orderCode sea una cadena no vacía antes de usarlo
      const hasValidCode = orderCode && typeof orderCode === "string" && orderCode.trim().length > 0;
      const url = hasValidCode
        ? `/api/orders/code/${orderCode}`
        : orderId
        ? `/api/orders/${orderId}`
        : null;
      
      if (!url) {
        throw new Error("No se proporcionó código de orden ni ID válido");
      }
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.detail || errorData.error?.title || `Error al verificar orden: ${response.statusText}`);
      }

      const result = await response.json();
      const orderStatus = result.data?.status;

      // Si la orden está pagada, el pago fue exitoso
      if (orderStatus === "PAID") {
        setStatus("success");
        if (onSuccess) {
          onSuccess();
        } else {
          // Redirigir a success después de 2 segundos por defecto
          setTimeout(() => {
            router.push("/checkout/success");
          }, 2000);
        }
      } else if (retryCount < maxRetries) {
        // Esperar y reintentar si el webhook aún no procesó
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          verifyPayment();
        }, retryDelay);
      } else {
        // Máximo de reintentos alcanzado
        setStatus("error");
        const message = "No se pudo verificar el estado del pago. Por favor, contacta con soporte.";
        setErrorMessage(message);
        if (onError) {
          onError(message);
        }
      }
    } catch (error) {
      logger.error("Error verificando pago", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error al verificar el pago. Por favor, contacta con soporte.";
      setStatus("error");
      setErrorMessage(message);
      if (onError) {
        onError(message);
      }
    }
  }, [orderCode, orderId, router, onSuccess, onError, maxRetries, retryDelay, retryCount]);

  useEffect(() => {
    if (enabled && (orderCode || orderId)) {
      verifyPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, orderCode, orderId]);

  return {
    status,
    errorMessage,
    verifyPayment,
  };
}

