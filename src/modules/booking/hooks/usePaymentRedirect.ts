/**
 * Hook para manejar redirects de pago (PayPal y Payway)
 * Encapsula la lógica de creación de pagos y redirects
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/services/logger";

export interface PaymentRedirectOptions {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: "paypal" | "payway";
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
        } else if (options.paymentMethod === "payway") {
          endpoint = "/api/payments/payway/create";
          body = {
            orderId: options.orderId,
            amount: options.amount,
            currency: options.currency,
            customerEmail: options.customerEmail,
            customerName: options.customerName,
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
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al iniciar el proceso de pago";
        setError(errorMessage);
        logger.error("Error iniciando pago", err);

        // Redirigir a página de error
        router.push(
          `/checkout/payment-error?orderId=${options.orderId}&reason=${options.paymentMethod}_error`
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

