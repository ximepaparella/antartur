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
        return {
          success: false,
          error: `Error ${response.status}: ${response.statusText}`,
        };
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching available payment methods:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  },
};
