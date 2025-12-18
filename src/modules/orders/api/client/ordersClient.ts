/**
 * Cliente API para Orders (frontend)
 * Para uso en Client Components
 */

import type { PaymentMethod, SelectedAdditional } from "@/lib/types/order";

export interface CreateOrderRequest {
  tourId: string;
  date: string;
  startTime: string;
  numAdults: number;
  numChildren: number;
  numInfants?: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  passengers: Array<{
    type: "ADULT" | "CHILD" | "INFANT";
    firstName: string;
    lastName: string;
    birthDate?: string;
    documentType?: string;
    documentNumber?: string;
    nationality?: string;
    email?: string;
    phone?: string;
    restrictions?: Record<string, unknown>;
  }>;
  notes?: string;
  paymentMethod?: PaymentMethod;
  exceedsAvailability?: boolean;
  hasRestrictionViolations?: boolean;
  additionals?: SelectedAdditional[];
}

export interface CreateOrderResponse {
  id: string;
  code: string;
  type: "RESERVATION" | "ENQUIRY";
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  currency: string;
  totalAmount: number;
  expiresAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Crea una orden/reserva en el servidor
 */
export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error al crear la orden: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

