/**
 * Hook para manejar redirects de pago (PayPal y Payway)
 * Encapsula la lógica de creación de pagos y redirects
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/services/logger";

/** Límite de caracteres para detalles de error */
const MAX_ERROR_LENGTH = 500;
const MAX_URL_MESSAGE_LENGTH = 200;

/**
 * Serializa un objeto de forma segura, manejando estructuras circulares
 */
function safeStringify(obj: unknown, maxLength = MAX_ERROR_LENGTH): string {
  try {
    const str = JSON.stringify(obj);
    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
  } catch {
    return "[unserializable error]";
  }
}

/**
 * Sanitiza un string para uso seguro en URLs y logs
 * Remueve caracteres peligrosos y limita longitud
 */
function sanitizeForUrl(str: string, maxLength = MAX_URL_MESSAGE_LENGTH): string {
  return str
    .replace(/[<>"'\n\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export interface PaymentRedirectOptions {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: "paypal"; // Payway ahora se maneja con modal, no redirect
  customerEmail?: string;
  customerName?: string;
}

export interface UsePaymentRedirectReturn {
  initiatePayment: (options: PaymentRedirectOptions) => Promise<void>;
  isRedirecting: boolean;
  error: string | null;
}

/**
 * Hook para manejar la creación de pagos y redirects a gateways de pago
 */
export function usePaymentRedirect(): UsePaymentRedirectReturn {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = useCallback(
    async (options: PaymentRedirectOptions) => {
      setIsRedirecting(true);
      setError(null);

      try {
        let endpoint: string;
        let body: Record<string, unknown>;

        if (options.paymentMethod === "paypal") {
          endpoint = "/api/payments/paypal/create";
          body = {
            orderId: options.orderId,
            amount: options.amount,
            currency: options.currency,
          };
        } else {
          throw new Error(`Método de pago no soportado: ${options.paymentMethod}`);
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Error al crear orden de pago: ${response.statusText}`
          );
        }

        const result = await response.json();

        if (!result.data?.redirectUrl) {
          throw new Error("No se recibió URL de redirect del servidor");
        }

        // Redirigir al gateway de pago
        window.location.href = result.data.redirectUrl;
      } catch (err) {
        // Extraer mensaje de error detallado de forma segura
        let errorMessage = "Error al iniciar el proceso de pago";
        let errorDetails = "";
        
        if (err instanceof Error) {
          errorMessage = err.message;
          // Truncar stack trace para evitar logs excesivos
          errorDetails = (err.stack || "").slice(0, MAX_ERROR_LENGTH);
        } else if (typeof err === "object" && err !== null) {
          // Intentar extraer mensaje de objetos de error
          const errObj = err as Record<string, unknown>;
          if (errObj.message) {
            errorMessage = String(errObj.message);
          }
          // Usar safeStringify para manejar estructuras circulares
          errorDetails = safeStringify(err);
        } else if (typeof err === "string") {
          errorMessage = err;
        }
        
        setError(errorMessage);
        
        // Log con detalles truncados y sanitizados
        logger.error("Error iniciando pago", new Error(errorMessage), {
          paymentMethod: options.paymentMethod,
          orderId: options.orderId,
          errorDetails,
        });

        // Sanitizar mensaje para URL (evitar XSS y caracteres problemáticos)
        const sanitizedMessage = sanitizeForUrl(errorMessage);
        const encodedMessage = encodeURIComponent(sanitizedMessage);
        
        router.push(
          `/checkout/payment-error?orderId=${options.orderId}&reason=${options.paymentMethod}_error&message=${encodedMessage}`
        );
      } finally {
        setIsRedirecting(false);
      }
    },
    [router]
  );

  return {
    initiatePayment,
    isRedirecting,
    error,
  };
}

