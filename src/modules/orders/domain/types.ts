/**
 * Tipos de dominio para Orders
 */

import type { OrderType, OrderStatus } from "@prisma/client";

export type { OrderType, OrderStatus };

export interface Order {
  id: string;
  code: string;
  type: OrderType;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  currency: string;
  totalAmount: number;
  expiresAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  type: OrderType;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  currency: string;
  totalAmount: number;
  expiresAt?: Date;
  notes?: string;
}

export interface ReservationInput {
  tourId: string;
  departureId: string;
  numAdults: number;
  numChildren: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  passengers: PassengerInput[];
  notes?: string;
  additionals?: Array<{
    additionalId: string;
    name: string;
    priceAdult: number;
    priceChild: number;
    currency: string;
  }>;
}

export interface PassengerInput {
  type: "ADULT" | "CHILD" | "INFANT";
  firstName: string;
  lastName: string;
  birthDate?: Date;
  documentType?: string;
  documentNumber?: string;
  nationality?: string;
  email?: string;
  phone?: string;
  restrictions?: Record<string, unknown>;
}

