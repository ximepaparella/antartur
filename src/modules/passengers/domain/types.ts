/**
 * Tipos de dominio para Passengers
 */

import type { PassengerType } from "@prisma/client";

export type { PassengerType };

export interface Passenger {
  id: string;
  bookingId: string;
  type: PassengerType;
  firstName: string;
  lastName: string;
  birthDate?: Date | null;
  documentType?: string | null;
  documentNumber?: string | null;
  nationality?: string | null;
  email?: string | null;
  phone?: string | null;
  restrictions?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePassengerInput {
  bookingId: string;
  type: PassengerType;
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

