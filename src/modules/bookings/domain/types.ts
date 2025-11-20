/**
 * Tipos de dominio para Bookings
 */

import type { BookingStatus } from "@prisma/client";

export type { BookingStatus };

export interface Booking {
  id: string;
  orderId: string;
  tourDepartureId: string;
  status: BookingStatus;
  numAdults: number;
  numChildren: number;
  totalSeats: number;
  unitPriceAdult: number;
  unitPriceChild: number;
  currency: string;
  tourNameSnapshot: string;
  departureDateSnapshot: Date;
  startTimeSnapshot: string;
  meetingPointSnapshot?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingInput {
  orderId: string;
  tourDepartureId: string;
  numAdults: number;
  numChildren: number;
  totalSeats: number;
  unitPriceAdult: number;
  unitPriceChild: number;
  currency: string;
  tourNameSnapshot: string;
  departureDateSnapshot: Date;
  startTimeSnapshot: string;
  meetingPointSnapshot?: string;
}

