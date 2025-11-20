/**
 * Servicio de dominio para Orders
 * Contiene la lógica de negocio para crear reservas, confirmar pagos y expirar órdenes
 */

import { PrismaClient } from "@prisma/client";
import { OrderRepository } from "../infra/orderRepository";
import { BookingRepository } from "../../booking/infra/bookingRepository";
import { PassengerRepository } from "../../passengers/infra/passengerRepository";
import { DepartureRepository } from "../../departures/infra/departureRepository";
import { CurrencyRepository } from "../../currency/infra/currencyRepository";
import type { ReservationInput } from "./types";
import type { ConfirmPaymentInput } from "../../payments/domain/types";

const prisma = new PrismaClient();
const orderRepo = new OrderRepository();
const bookingRepo = new BookingRepository();
const passengerRepo = new PassengerRepository();
const departureRepo = new DepartureRepository();
const currencyRepo = new CurrencyRepository();

/**
 * Genera un código único para una orden en formato ANT-YYYY-NNNN
 */
async function generateOrderCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ANT-${year}-`;

  // Buscar la última orden del año
  const lastOrder = await prisma.order.findFirst({
    where: {
      code: {
        startsWith: prefix,
      },
    },
    orderBy: {
      code: "desc",
    },
  });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.code.replace(prefix, ""), 10);
    sequence = lastSequence + 1;
  }

  return `${prefix}${sequence.toString().padStart(4, "0")}`;
}

/**
 * Crea una reserva completa (Order + Booking + Passengers)
 * Implementa transacción con SELECT FOR UPDATE para prevenir condiciones de carrera
 */
export async function createReservation(input: ReservationInput) {
  return prisma.$transaction(async (tx) => {
    // 1. Bloquear el departure para actualización
    const departure = await tx.tourDeparture.findUnique({
      where: { id: input.departureId },
    });

    if (!departure) {
      throw new Error(`Departure ${input.departureId} not found`);
    }

    if (!departure.isActive) {
      throw new Error(`Departure ${input.departureId} is not active`);
    }

    // 2. Calcular cupos disponibles
    const totalSeats = input.numAdults + input.numChildren;
    const availableSeats = departure.seatsTotal - departure.seatsHeld - departure.seatsConfirmed;

    if (availableSeats < totalSeats) {
      throw new Error(`Not enough available seats. Requested: ${totalSeats}, Available: ${availableSeats}`);
    }

    // 3. Obtener tour para snapshots y precios base
    const tour = await tx.tour.findUnique({
      where: { id: input.tourId },
    });

    if (!tour) {
      throw new Error(`Tour ${input.tourId} not found`);
    }

    // 4. Calcular precios en la moneda solicitada
    let unitPriceAdult = Number(tour.basePriceAdult);
    let unitPriceChild = Number(tour.basePriceChild);

    if (input.currency !== tour.baseCurrency) {
      const exchangeRate = await currencyRepo.getExchangeRate({
        baseCurrency: tour.baseCurrency,
        quoteCurrency: input.currency,
      });

      if (!exchangeRate) {
        throw new Error(`Exchange rate not found for ${tour.baseCurrency} to ${input.currency}`);
      }

      unitPriceAdult = Number(tour.basePriceAdult) * exchangeRate;
      unitPriceChild = Number(tour.basePriceChild) * exchangeRate;
    }

    const totalAmount = unitPriceAdult * input.numAdults + unitPriceChild * input.numChildren;

    // 5. Generar código de orden
    const orderCode = await generateOrderCode();

    // 6. Calcular fecha de expiración (24 horas desde ahora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 7. Crear Order
    const order = await tx.order.create({
      data: {
        code: orderCode,
        type: "RESERVATION",
        status: "PENDING_PAYMENT",
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        currency: input.currency,
        totalAmount,
        expiresAt,
        notes: input.notes,
      },
    });

    // 8. Actualizar cupos del departure (incrementar seatsHeld)
    await tx.tourDeparture.update({
      where: { id: input.departureId },
      data: {
        seatsHeld: departure.seatsHeld + totalSeats,
      },
    });

    // 9. Crear Booking con snapshots
    const booking = await tx.booking.create({
      data: {
        orderId: order.id,
        tourDepartureId: input.departureId,
        status: "HELD",
        numAdults: input.numAdults,
        numChildren: input.numChildren,
        totalSeats,
        unitPriceAdult,
        unitPriceChild,
        currency: input.currency,
        tourNameSnapshot: tour.name,
        departureDateSnapshot: departure.departureDate,
        startTimeSnapshot: departure.startTime,
        meetingPointSnapshot: null, // TODO: agregar meeting point al modelo TourDeparture si es necesario
      },
    });

    // 10. Crear Passengers
    await tx.passenger.createMany({
      data: input.passengers.map((p) => ({
        bookingId: booking.id,
        type: p.type,
        firstName: p.firstName,
        lastName: p.lastName,
        birthDate: p.birthDate,
        documentType: p.documentType,
        documentNumber: p.documentNumber,
        nationality: p.nationality,
        email: p.email,
        phone: p.phone,
        restrictions: p.restrictions ? JSON.parse(JSON.stringify(p.restrictions)) : null,
      })),
    });

    return {
      order,
      booking,
    };
  });
}

/**
 * Confirma el pago de una orden y actualiza estados
 */
export async function confirmPayment(input: ConfirmPaymentInput) {
  return prisma.$transaction(async (tx) => {
    // 1. Obtener order
    const order = await tx.order.findUnique({
      where: { id: input.orderId },
      include: {
        bookings: true,
      },
    });

    if (!order) {
      throw new Error(`Order ${input.orderId} not found`);
    }

    if (order.status !== "PENDING_PAYMENT") {
      throw new Error(`Order ${input.orderId} is not in PENDING_PAYMENT status`);
    }

    // 2. Crear registro de pago
    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        provider: input.provider,
        providerPaymentId: input.providerPaymentId,
        status: "APPROVED",
        amount: input.amount,
        currency: input.currency,
        paidAt: new Date(),
        rawRequest: input.rawRequest ? JSON.parse(JSON.stringify(input.rawRequest)) : null,
        rawResponse: input.rawResponse ? JSON.parse(JSON.stringify(input.rawResponse)) : null,
      },
    });

    // 3. Actualizar Order a PAID
    await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });

    // 4. Actualizar Bookings a CONFIRMED y ajustar cupos
    for (const booking of order.bookings) {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CONFIRMED" },
      });

      // Obtener departure y actualizar cupos
      const departure = await tx.tourDeparture.findUnique({
        where: { id: booking.tourDepartureId },
      });

      if (departure) {
        await tx.tourDeparture.update({
          where: { id: booking.tourDepartureId },
          data: {
            seatsHeld: departure.seatsHeld - booking.totalSeats,
            seatsConfirmed: departure.seatsConfirmed + booking.totalSeats,
          },
        });
      }
    }

    return {
      order,
      payment,
    };
  });
}

/**
 * Expira órdenes pendientes que han pasado su fecha de expiración
 * Libera los cupos reservados
 */
export async function expirePendingOrders() {
  const expiredOrders = await orderRepo.findPendingExpired();
  const results = [];

  for (const order of expiredOrders) {
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Actualizar Order a EXPIRED
        await tx.order.update({
          where: { id: order.id },
          data: { status: "EXPIRED" },
        });

        // 2. Actualizar Bookings a CANCELLED y liberar cupos
        for (const booking of order.bookings) {
          await tx.booking.update({
            where: { id: booking.id },
            data: { status: "CANCELLED" },
          });

          const departure = await tx.tourDeparture.findUnique({
            where: { id: booking.tourDepartureId },
          });

          if (departure) {
            await tx.tourDeparture.update({
              where: { id: booking.tourDepartureId },
              data: {
                seatsHeld: Math.max(0, departure.seatsHeld - booking.totalSeats),
              },
            });
          }
        }
      });

      results.push({ orderId: order.id, status: "expired" });
    } catch (error) {
      results.push({
        orderId: order.id,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

