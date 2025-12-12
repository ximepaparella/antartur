/**
 * Tipos de dominio para Payments
 */

import type { PaymentStatus } from "@prisma/client";

export type { PaymentStatus };

// Re-export gateway config types
export type {
  PaymentProvider,
  GatewayConfig,
  PayPalCredentials,
  PaywayCredentials,
} from "./gatewayConfigService";

export interface Payment {
  id: string;
  orderId: string;
  provider: string;
  providerPaymentId?: string | null;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paidAt?: Date | null;
  rawRequest?: Record<string, unknown> | null;
  rawResponse?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentInput {
  orderId: string;
  provider: string;
  providerPaymentId?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paidAt?: Date;
  rawRequest?: Record<string, unknown>;
  rawResponse?: Record<string, unknown>;
}

export interface ConfirmPaymentInput {
  orderId: string;
  provider: string;
  providerPaymentId: string;
  amount: number;
  currency: string;
  rawRequest?: Record<string, unknown>;
  rawResponse?: Record<string, unknown>;
}

/**
 * Método de pago disponible para el checkout
 * Usado por la API /api/payments/available y el hook useAvailablePaymentMethods
 */
export interface AvailablePaymentMethod {
  provider: string;
  displayName: string;
  currency: string;
}

