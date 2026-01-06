/**
 * Payments API Client
 * Cliente para consumir endpoints de pagos desde el frontend
 * Sigue el patrón de adminApiClient
 */

import type { AvailablePaymentMethod } from "../../domain/types";

interface AvailableMethodsResponse {
  success: boolean;
  data?: {
    methods: AvailablePaymentMethod[];
    hasOnlinePayment: boolean;
  };
  error?: string;
}

/**
 * Cliente de API para operaciones de pagos
 */
export const paymentsClient = {
  /**
   * Obtiene los métodos de pago disponibles según la moneda
   * Solo retorna métodos con gateways activos
   */
  getAvailableMethods: async (currency?: string): Promise<AvailableMethodsResponse> => {
    try {
      const url = currency
        ? `/api/payments/available?currency=${currency}`
        : "/api/payments/available";

      const response = await fetch(url);

      if (!response.ok) {
        try {
          const errorData = await response.json();
          if (errorData.error && typeof errorData.error === "object") {
            return {
              success: false,
              error: errorData.error.detail || errorData.error.title || `Error ${response.status}`,
            };
          }
          if (typeof errorData.error === "string") {
            return {
              success: false,
              error: errorData.error,
            };
          }
        } catch {
          // Si no se puede parsear, usar el status
        }
        return {
          success: false,
          error: `Error ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  },
};
