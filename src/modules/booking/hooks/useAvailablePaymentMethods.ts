/**
 * Hook para obtener métodos de pago disponibles desde la API
 * Considera solo los gateways activos en la base de datos
 */

import { useState, useEffect, useCallback } from "react";
import type { PaymentMethod } from "@/lib/types/order";
import { paymentsClient } from "@/modules/payments/api/client/paymentsClient";
import { isValidPaymentMethod, ALWAYS_AVAILABLE_METHODS } from "@/modules/payments/domain/constants";

interface UseAvailablePaymentMethodsReturn {
  methods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  hasOnlinePayment: boolean;
  noMethodsAvailable: boolean;
  refetch: () => void;
}

/**
 * Hook para obtener los métodos de pago disponibles según la moneda
 * Solo retorna métodos que estén activos en la base de datos
 */
export function useAvailablePaymentMethods(
  currencyCode: string
): UseAvailablePaymentMethodsReturn {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasOnlinePayment, setHasOnlinePayment] = useState(false);

  const fetchMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await paymentsClient.getAvailableMethods(currencyCode);

    if (result.success && result.data) {
      // Convertir providers a PaymentMethod type usando validación centralizada
      const availableMethods = result.data.methods
        .map((m) => m.provider)
        .filter((provider): provider is PaymentMethod => isValidPaymentMethod(provider));

      setMethods(availableMethods);
      setHasOnlinePayment(result.data.hasOnlinePayment);
      setError(null);
    } else {
      // En caso de error, usar fallback de métodos siempre disponibles
      const fallbackMethods = (ALWAYS_AVAILABLE_METHODS[currencyCode] || []) as PaymentMethod[];
      setMethods(fallbackMethods);
      setHasOnlinePayment(false);
      setError(result.error || "Error al obtener métodos de pago");
    }

    setIsLoading(false);
  }, [currencyCode]);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  return {
    methods,
    isLoading,
    error,
    hasOnlinePayment,
    noMethodsAvailable: !isLoading && methods.length === 0,
    refetch: fetchMethods,
  };
}
