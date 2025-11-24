/**
 * Servicio de dominio para Orders
 * Contiene la lógica de negocio para crear reservas, confirmar pagos y expirar órdenes
 */

import { OrderRepository } from "../infra/orderRepository";
import { BookingRepository } from "../../booking/infra/bookingRepository";
import { PassengerRepository } from "../../passengers/infra/passengerRepository";
import { DepartureRepository } from "../../departures/infra/departureRepository";
import { TourPriceRepository } from "../../tours/infra/tourPriceRepository";
import type { ReservationInput } from "./types";
import type { ConfirmPaymentInput } from "../../payments/domain/types";
import { calculateAge, validateMinAge, validateMinPassengers, calculateAdditionalsSubtotal } from "@/lib/utils/pricing";
import { prisma } from "@/lib/db";
import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

const orderRepo = new OrderRepository();
const bookingRepo = new BookingRepository();
const passengerRepo = new PassengerRepository();
const departureRepo = new DepartureRepository();
const tourPriceRepo = new TourPriceRepository();

/**
 * Genera un código único para una orden en formato ANT-YYYY-NNNN
 * Debe ejecutarse dentro de una transacción para evitar race conditions
 */
async function generateOrderCode(tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ANT-${year}-`;

  // Buscar la última orden del año usando la transacción
  const lastOrder = await tx.order.findFirst({
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
    // 1. Bloquear el departure para actualización con SELECT FOR UPDATE
    await tx.$queryRaw`
      SELECT * FROM "TourDeparture"
      WHERE id = ${input.departureId}
      FOR UPDATE
    `;
    
    const departure = await tx.tourDeparture.findUnique({
      where: { id: input.departureId },
    });

    if (!departure) {
      throw new Error(`Departure ${input.departureId} not found`);
    }

    if (!departure.isActive) {
      throw new Error(`Departure ${input.departureId} is not active`);
    }

    // 2. Obtener tour para snapshots y validaciones
    const tour = await tx.tour.findUnique({
      where: { id: input.tourId },
    });

    if (!tour) {
      throw new Error(`Tour ${input.tourId} not found`);
    }

    // 3. Validar mínimo de pasajeros
    if (tour.minPassengers) {
      const totalSeats = input.numAdults + input.numChildren;
      if (!validateMinPassengers(totalSeats, tour.minPassengers)) {
        throw new Error(`This tour requires a minimum of ${tour.minPassengers} passenger${tour.minPassengers > 1 ? "s" : ""}`);
      }
    }

    // 4. Validar edad mínima de pasajeros
    if (tour.minAge && input.passengers) {
      for (const passenger of input.passengers) {
        if (passenger.birthDate) {
          const age = calculateAge(passenger.birthDate.toISOString().split("T")[0]);
          if (!validateMinAge(age, tour.minAge)) {
            throw new Error(`Passenger ${passenger.firstName} ${passenger.lastName} does not meet the minimum age requirement of ${tour.minAge} years (age: ${age})`);
          }
        }
      }
    }

    // 5. Calcular cupos disponibles
    const totalSeats = input.numAdults + input.numChildren;
    const availableSeats = departure.seatsTotal - departure.seatsHeld - departure.seatsConfirmed;

    if (availableSeats < totalSeats) {
      throw new Error(`Not enough available seats. Requested: ${totalSeats}, Available: ${availableSeats}`);
    }

    // 6. Obtener precios directamente de TourPrice en la moneda solicitada
    const tourPrice = await tx.tourPrice.findUnique({
      where: {
        tourId_currency: {
          tourId: input.tourId,
          currency: input.currency,
        },
      },
    });

    if (!tourPrice) {
      throw new Error(`Price not found for tour ${input.tourId} in currency ${input.currency}`);
    }

    const unitPriceAdult = Number(tourPrice.priceAdult);
    const unitPriceChild = Number(tourPrice.priceChild);

    // Calcular total base
    let totalAmount = unitPriceAdult * input.numAdults + unitPriceChild * input.numChildren;

    // Sumar additionals si existen
    if (input.additionals && input.additionals.length > 0) {
      const additionalsSubtotal = calculateAdditionalsSubtotal(
        input.additionals,
        input.numAdults,
        input.numChildren,
        {
          currencyCode: input.currency,
          priceAdult: unitPriceAdult,
          priceChild: unitPriceChild,
        }
      );
      totalAmount += additionalsSubtotal;
    }

    // 7. Generar código de orden dentro de la transacción
    const orderCode = await generateOrderCode(tx);

    // 8. Calcular fecha de expiración (24 horas desde ahora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 9. Crear Order con información de additionals en notes si existen
    const orderNotes = input.notes || "";
    const additionalsNote = input.additionals && input.additionals.length > 0
      ? `\n\nAdditionals seleccionados: ${input.additionals.map(a => a.name).join(", ")}`
      : "";

    // 10. Crear Order
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
        notes: orderNotes + additionalsNote,
      },
    });

    // 11. Actualizar cupos del departure (incrementar seatsHeld)
    await tx.tourDeparture.update({
      where: { id: input.departureId },
      data: {
        seatsHeld: departure.seatsHeld + totalSeats,
      },
    });

    // 12. Crear Booking con snapshots
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

    // 13. Crear Passengers
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
        restrictions: p.restrictions ? (structuredClone(p.restrictions) as any) : Prisma.JsonNull,
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
        rawRequest: input.rawRequest ? (structuredClone(input.rawRequest) as any) : Prisma.JsonNull,
        rawResponse: input.rawResponse ? (structuredClone(input.rawResponse) as any) : Prisma.JsonNull,
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

      if (!departure) {
        throw new Error(
          `Departure ${booking.tourDepartureId} not found for booking ${booking.id}`
        );
      }

      await tx.tourDeparture.update({
        where: { id: booking.tourDepartureId },
        data: {
          seatsHeld: Math.max(0, departure.seatsHeld - booking.totalSeats),
          seatsConfirmed: departure.seatsConfirmed + booking.totalSeats,
        },
      });
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
        // 1. Verificar que la orden sigue en PENDING_PAYMENT antes de expirar
        const freshOrder = await tx.order.findUnique({
          where: { id: order.id },
          include: { bookings: true },
        });

        if (!freshOrder || freshOrder.status !== "PENDING_PAYMENT") {
          // La orden cambió de estado (probablemente fue pagada), saltar
          return;
        }

        // 2. Actualizar Order a EXPIRED
        await tx.order.update({
          where: { id: freshOrder.id },
          data: { status: "EXPIRED" },
        });

        // 3. Actualizar Bookings a CANCELLED y liberar cupos
        for (const booking of freshOrder.bookings) {
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

