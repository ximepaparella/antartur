/**
 * Data Transfer Objects (DTOs) para Orders
 * Transformaciones entre modelos de dominio y respuestas de API
 */

import type { Order as PrismaOrder, Booking, Passenger, Payment } from "@prisma/client";

/**
 * DTO de respuesta para Order básico
 */
export interface OrderResponse {
  id: string;
  code: string;
  type: string;
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
 * DTO de respuesta para Order con bookings
 */
export interface OrderWithBookingsResponse extends OrderResponse {
  bookings: BookingResponse[];
}

/**
 * DTO de respuesta para Order completo (con bookings, passengers y payments)
 */
export interface OrderFullResponse extends OrderWithBookingsResponse {
  payments: PaymentResponse[];
}

/**
 * DTO de respuesta para TourDeparture (opcional, cuando está incluido)
 */
export interface TourDepartureResponse {
  id: string;
  departureDate: string;
  startTime: string;
  endTime: string | null;
  seatsTotal: number;
  seatsHeld: number;
  seatsConfirmed: number;
  isActive: boolean;
  tour?: {
    id: string;
    slug: string;
    name: string;
  };
}

/**
 * DTO de respuesta para Booking
 */
export interface BookingResponse {
  id: string;
  orderId: string;
  tourDepartureId: string;
  status: string;
  numAdults: number;
  numChildren: number;
  totalSeats: number;
  unitPriceAdult: number;
  unitPriceChild: number;
  currency: string;
  tourNameSnapshot: string;
  departureDateSnapshot: string;
  startTimeSnapshot: string;
  meetingPointSnapshot: string | null;
  passengers: PassengerResponse[];
  tourDeparture?: TourDepartureResponse;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO de respuesta para Passenger
 */
export interface PassengerResponse {
  id: string;
  bookingId: string;
  type: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  documentType: string | null;
  documentNumber: string | null;
  nationality: string | null;
  email: string | null;
  phone: string | null;
  restrictions: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO de respuesta para Payment
 */
export interface PaymentResponse {
  id: string;
  orderId: string;
  provider: string;
  providerPaymentId: string | null;
  status: string;
  amount: number;
  currency: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transforma un Order de Prisma a OrderResponse
 */
export function toOrderResponse(order: PrismaOrder): OrderResponse {
  return {
    id: order.id,
    code: order.code,
    type: order.type,
    status: order.status,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    currency: order.currency,
    totalAmount: Number(order.totalAmount),
    expiresAt: order.expiresAt?.toISOString() || null,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

/**
 * Transforma un Passenger de Prisma a PassengerResponse
 */
export function toPassengerResponse(passenger: Passenger): PassengerResponse {
  return {
    id: passenger.id,
    bookingId: passenger.bookingId,
    type: passenger.type,
    firstName: passenger.firstName,
    lastName: passenger.lastName,
    birthDate: passenger.birthDate?.toISOString().split("T")[0] || null,
    documentType: passenger.documentType,
    documentNumber: passenger.documentNumber,
    nationality: passenger.nationality,
    email: passenger.email,
    phone: passenger.phone,
    restrictions: passenger.restrictions as Record<string, unknown> | null,
    createdAt: passenger.createdAt.toISOString(),
    updatedAt: passenger.updatedAt.toISOString(),
  };
}

/**
 * Transforma un TourDeparture de Prisma a TourDepartureResponse.
 * startTime/endTime vienen del tour (defaultStartTime/defaultEndTime) si está incluido.
 */
export function toTourDepartureResponse(departure: any): TourDepartureResponse | undefined {
  if (!departure) return undefined;
  const startTime = departure.tour?.defaultStartTime?.trim() || "09:00";
  const endTime = departure.tour?.defaultEndTime?.trim() || null;

  return {
    id: departure.id,
    departureDate: departure.departureDate.toISOString().split("T")[0],
    startTime,
    endTime,
    seatsTotal: departure.seatsTotal,
    seatsHeld: departure.seatsHeld,
    seatsConfirmed: departure.seatsConfirmed,
    isActive: departure.isActive,
    tour: departure.tour ? {
      id: departure.tour.id,
      slug: departure.tour.slug,
      name: departure.tour.name,
    } : undefined,
  };
}

/**
 * Transforma un Booking de Prisma a BookingResponse
 */
export function toBookingResponse(
  booking: Booking & { 
    passengers?: Passenger[];
    tourDeparture?: any;
  }
): BookingResponse {
  return {
    id: booking.id,
    orderId: booking.orderId,
    tourDepartureId: booking.tourDepartureId,
    status: booking.status,
    numAdults: booking.numAdults,
    numChildren: booking.numChildren,
    totalSeats: booking.totalSeats,
    unitPriceAdult: Number(booking.unitPriceAdult),
    unitPriceChild: Number(booking.unitPriceChild),
    currency: booking.currency,
    tourNameSnapshot: booking.tourNameSnapshot,
    departureDateSnapshot: booking.departureDateSnapshot.toISOString().split("T")[0],
    startTimeSnapshot: booking.startTimeSnapshot,
    meetingPointSnapshot: booking.meetingPointSnapshot,
    passengers: booking.passengers?.map(toPassengerResponse) || [],
    tourDeparture: toTourDepartureResponse(booking.tourDeparture),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

/**
 * Transforma un Payment de Prisma a PaymentResponse
 */
export function toPaymentResponse(payment: Payment): PaymentResponse {
  return {
    id: payment.id,
    orderId: payment.orderId,
    provider: payment.provider,
    providerPaymentId: payment.providerPaymentId,
    status: payment.status,
    amount: Number(payment.amount),
    currency: payment.currency,
    paidAt: payment.paidAt?.toISOString() || null,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

/**
 * Transforma un Order con bookings a OrderWithBookingsResponse
 */
export function toOrderWithBookingsResponse(
  order: PrismaOrder & { 
    bookings?: (Booking & { 
      passengers?: Passenger[];
      tourDeparture?: any;
    })[];
  }
): OrderWithBookingsResponse {
  const base = toOrderResponse(order);
  return {
    ...base,
    bookings: order.bookings?.map(toBookingResponse) || [],
  };
}

/**
 * Transforma un Order completo a OrderFullResponse
 */
export function toOrderFullResponse(
  order: PrismaOrder & {
    bookings?: (Booking & { passengers?: Passenger[] })[];
    payments?: Payment[];
  }
): OrderFullResponse {
  const base = toOrderWithBookingsResponse(order);
  return {
    ...base,
    payments: order.payments?.map(toPaymentResponse) || [],
  };
}

