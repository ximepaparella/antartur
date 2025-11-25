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
import { logger } from "@/lib/services/logger";

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

    // 5. Determinar tipo de orden
    const isEnquiry = input.exceedsAvailability || input.hasRestrictionViolations || false;
    const orderType: "RESERVATION" | "ENQUIRY" = isEnquiry ? "ENQUIRY" : "RESERVATION";

    // 6. Calcular cupos disponibles (solo validar si NO es ENQUIRY)
    const totalSeats = input.numAdults + input.numChildren;
    if (!isEnquiry) {
      const availableSeats = departure.seatsTotal - departure.seatsHeld - departure.seatsConfirmed;
      if (availableSeats < totalSeats) {
        throw new Error(`Not enough available seats. Requested: ${totalSeats}, Available: ${availableSeats}`);
      }
    }

    // 7. Obtener precios directamente de TourPrice en la moneda solicitada
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

    // 8. Generar código de orden dentro de la transacción
    const orderCode = await generateOrderCode(tx);

    // 9. Calcular fecha de expiración según método de pago
    const expiresAt = new Date();
    if (input.paymentMethod === "transferencia") {
      // Transferencia bancaria: 24 horas
      const bankTransferHours = parseInt(process.env.BANK_TRANSFER_EXPIRATION_HOURS || "24", 10);
      expiresAt.setHours(expiresAt.getHours() + bankTransferHours);
    } else {
      // PayPal/Payway/Consulta: tiempo configurable (default 1 hora)
      const orderExpirationHours = parseInt(process.env.ORDER_EXPIRATION_HOURS || "1", 10);
      expiresAt.setHours(expiresAt.getHours() + orderExpirationHours);
    }

    // 10. Crear Order con información de additionals en notes si existen
    const orderNotes = input.notes || "";
    const additionalsNote = input.additionals && input.additionals.length > 0
      ? `\n\nAdditionals seleccionados: ${input.additionals.map(a => a.name).join(", ")}`
      : "";
    
    // Agregar información sobre motivo de consulta si es ENQUIRY
    const enquiryNote = isEnquiry
      ? `\n\nMotivo de consulta: ${input.exceedsAvailability ? "Excede disponibilidad" : ""}${input.hasRestrictionViolations ? (input.exceedsAvailability ? " y " : "") + "Violación de restricciones" : ""}`
      : "";

    // 11. Crear Order
    const order = await tx.order.create({
      data: {
        code: orderCode,
        type: orderType,
        status: "PENDING_PAYMENT",
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        currency: input.currency,
        totalAmount,
        expiresAt,
        notes: orderNotes + additionalsNote + enquiryNote,
      },
    });

    // 12. Actualizar cupos del departure (solo si NO es ENQUIRY)
    if (!isEnquiry) {
      await tx.tourDeparture.update({
        where: { id: input.departureId },
        data: {
          seatsHeld: departure.seatsHeld + totalSeats,
        },
      });
    }

    // 13. Crear Booking con snapshots
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

    // 14. Crear Passengers
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

    // 3. Actualizar Order a PAID (reserva confirmada con pago)
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
      include: {
        bookings: {
          include: {
            passengers: true,
            tourDeparture: {
              include: {
                tour: true,
              },
            },
          },
        },
      },
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
      order: updatedOrder,
      payment,
    };
  });
}

/**
 * Envía email de confirmación de pago después de confirmar un pago
 */
export async function sendPaymentConfirmationEmail(orderId: string, paymentProvider: string, transactionId?: string) {
  try {
    const order = await getOrderWithRelations(orderId, true);

    if (!order.bookings || order.bookings.length === 0) {
      return;
    }

    const booking = order.bookings[0];
    const departure = booking.tourDeparture;
    const tour = departure?.tour;

    if (!tour || !departure) {
      return;
    }

    const passengers = booking.passengers || [];
    const passengerList = passengers.map((p) => ({
      firstName: p.firstName,
      lastName: p.lastName,
      type: p.type,
    }));

    const departureDate = new Date(booking.departureDateSnapshot || departure.departureDate).toLocaleDateString("es-AR");
    const startTime = booking.startTimeSnapshot || departure.startTime;

    const { sendEmail } = await import("../../notifications/domain/emailService");
    const { generatePaymentConfirmationEmailHTML, generatePaymentConfirmationEmailText } = await import("../../notifications/templates/paymentConfirmationEmail");

    const emailData = {
      orderCode: order.code,
      customerName: order.customerName,
      tourName: booking.tourNameSnapshot || tour.name,
      departureDate,
      startTime,
      numAdults: booking.numAdults,
      numChildren: booking.numChildren,
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      paymentMethod: paymentProvider,
      transactionId,
      passengers: passengerList,
    };

    const html = generatePaymentConfirmationEmailHTML(emailData);
    const text = generatePaymentConfirmationEmailText(emailData);

    // Enviar al cliente
    await sendEmail({
      to: order.customerEmail,
      subject: `Pago Confirmado - ${order.code}`,
      html,
      text,
      replyTo: "agencias@antartur.tur.ar",
    });

    logger.info("Payment confirmation email sent", {
      orderId,
      orderCode: order.code,
      customerEmail: order.customerEmail,
    });
  } catch (error) {
    logger.error("Error sending payment confirmation email", error);
    // No lanzar error para no romper el flujo de confirmación de pago
  }
}

/**
 * Cancela órdenes pendientes que han pasado su fecha de expiración
 * Libera los cupos reservados
 * Actualiza estado a CANCELLED (no EXPIRED, según requerimientos)
 */
export async function cancelExpiredOrders() {
  const expiredOrders = await orderRepo.findPendingExpired();
  const results = [];

  for (const order of expiredOrders) {
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Verificar que la orden sigue en PENDING_PAYMENT antes de cancelar
        const freshOrder = await tx.order.findUnique({
          where: { id: order.id },
          include: { bookings: true },
        });

        if (!freshOrder || freshOrder.status !== "PENDING_PAYMENT") {
          // La orden cambió de estado (probablemente fue pagada), saltar
          return;
        }

        // 2. Actualizar Order a CANCELLED
        await tx.order.update({
          where: { id: freshOrder.id },
          data: { status: "CANCELLED" },
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

      results.push({ orderId: order.id, status: "cancelled" });
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

/**
 * Expira órdenes pendientes que han pasado su fecha de expiración
 * Libera los cupos reservados
 * @deprecated Usar cancelExpiredOrders en su lugar
 */
export async function expirePendingOrders() {
  return cancelExpiredOrders();
}

/**
 * Encuentra un departure por tourId (slug), date y startTime
 * Retorna el departureId y tourId real
 */
export async function findDepartureByTourDateAndTime(
  tourIdOrSlug: string,
  date: string,
  startTime: string
): Promise<{ departureId: string; tourId: string }> {
  const { TourRepository } = await import("../../tours/infra/tourRepository");
  const { NotFoundError } = await import("@/lib/api/errorHandler");
  const tourRepository = new TourRepository();

  // Buscar tour por slug si tourId es un slug
  const tour = await tourRepository.findBySlug(tourIdOrSlug);
  if (!tour) {
    throw new NotFoundError("Tour", tourIdOrSlug);
  }

  // Buscar departure por tourId, date y startTime
  const departure = await prisma.tourDeparture.findFirst({
    where: {
      tourId: tour.id,
      departureDate: new Date(date),
      startTime: startTime,
    },
  });

  if (!departure) {
    throw new NotFoundError(
      "TourDeparture",
      `Tour ${tourIdOrSlug} on ${date} at ${startTime}`
    );
  }

  return { departureId: departure.id, tourId: tour.id };
}

/**
 * Valida que el número de pasajeros coincida con adultos + niños
 */
export function validatePassengerCount(
  passengers: Array<unknown>,
  numAdults: number,
  numChildren: number
): void {
  const { ValidationError } = require("@/lib/api/errorHandler");
  const totalPassengers = numAdults + numChildren;
  if (passengers.length !== totalPassengers) {
    throw new ValidationError(
      `Number of passengers (${passengers.length}) does not match adults + children (${totalPassengers})`
    );
  }
}

/**
 * Valida que haya al menos un adulto si hay niños
 */
export function validateAdultRequired(numAdults: number, numChildren: number): void {
  const { ValidationError } = require("@/lib/api/errorHandler");
  if (numChildren > 0 && numAdults === 0) {
    throw new ValidationError("At least one adult is required when booking for children");
  }
}

/**
 * Obtiene una orden completa con todas sus relaciones
 */
export async function getOrderWithRelations(orderId: string, includePayments = false) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      bookings: {
        include: {
          passengers: true,
          tourDeparture: {
            include: {
              tour: true,
            },
          },
        },
      },
      ...(includePayments && { payments: true }),
    },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  return order;
}

/**
 * Lista órdenes con filtros y paginación
 */
export async function listOrders(query: {
  status?: string;
  type?: string;
  customerEmail?: string;
  page?: number;
  limit?: number;
}) {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (query.status) {
    where.status = query.status;
  }
  if (query.type) {
    where.type = query.type;
  }
  if (query.customerEmail) {
    where.customerEmail = query.customerEmail;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        bookings: {
          include: {
            passengers: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { data: orders, total, page, limit };
}

/**
 * Obtiene una orden por código
 */
export async function getOrderByCode(code: string, includePayments = false) {
  const order = await prisma.order.findUnique({
    where: { code },
    include: {
      bookings: {
        include: {
          passengers: true,
        },
      },
      ...(includePayments && { payments: true }),
    },
  });

  if (!order) {
    throw new Error(`Order with code ${code} not found`);
  }

  return order;
}

/**
 * Envía emails de confirmación al cliente y copia a agencias@antartur.tur.ar
 */
export async function sendOrderEmails(order: {
  code: string;
  type: "RESERVATION" | "ENQUIRY";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  currency: string;
  notes: string | null;
  bookings?: Array<{
    numAdults: number;
    numChildren: number;
    departureDateSnapshot?: Date | string;
    startTimeSnapshot?: string;
    tourNameSnapshot?: string;
    passengers?: Array<{
      firstName: string;
      lastName: string;
      type: string;
    }>;
    tourDeparture?: {
      departureDate: Date;
      startTime: string;
      tour?: {
        name: string;
      };
    };
  }>;
}) {
  if (!order.bookings || order.bookings.length === 0) {
    return;
  }

  const { sendEmail } = await import("../../notifications/domain/emailService");
  const { generateReservationEmailHTML, generateReservationEmailText } = await import("../../notifications/templates/reservationEmail");
  const { generateEnquiryEmailHTML, generateEnquiryEmailText } = await import("../../notifications/templates/enquiryEmail");

  const booking = order.bookings[0];
  const departure = booking.tourDeparture;
  const tour = departure?.tour;

  if (!tour || !departure) {
    return;
  }

  const passengers = booking.passengers || [];
  const passengerList = passengers.map((p) => ({
    firstName: p.firstName,
    lastName: p.lastName,
    type: p.type,
  }));

  const departureDate = new Date(booking.departureDateSnapshot || departure.departureDate).toLocaleDateString("es-AR");
  const startTime = booking.startTimeSnapshot || departure.startTime;

  if (order.type === "ENQUIRY") {
    // Email de consulta
    const enquiryData = {
      orderCode: order.code,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      tourName: booking.tourNameSnapshot || tour.name,
      departureDate,
      startTime,
      numAdults: booking.numAdults,
      numChildren: booking.numChildren,
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      reason: order.notes || "",
      passengers: passengerList,
    };

    const html = generateEnquiryEmailHTML(enquiryData);
    const text = generateEnquiryEmailText(enquiryData);

    // Enviar al cliente
    await sendEmail({
      to: order.customerEmail,
      subject: `Consulta Recibida - ${order.code}`,
      html,
      text,
      replyTo: "agencias@antartur.tur.ar",
    });

    // Enviar copia a agencias@antartur.tur.ar
    await sendEmail({
      to: "agencias@antartur.tur.ar",
      subject: `Nueva Consulta - ${order.code}`,
      html,
      text,
      replyTo: order.customerEmail,
    });
  } else {
    // Email de reserva confirmada
    const reservationData = {
      orderCode: order.code,
      customerName: order.customerName,
      tourName: booking.tourNameSnapshot || tour.name,
      departureDate,
      startTime,
      numAdults: booking.numAdults,
      numChildren: booking.numChildren,
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      passengers: passengerList,
      additionals: [], // TODO: obtener additionals de order.notes si están disponibles
    };

    const html = generateReservationEmailHTML(reservationData);
    const text = generateReservationEmailText(reservationData);

    // Enviar al cliente
    await sendEmail({
      to: order.customerEmail,
      subject: `Confirmación de Reserva - ${order.code}`,
      html,
      text,
      replyTo: "agencias@antartur.tur.ar",
    });

    // Enviar copia a agencias@antartur.tur.ar
    await sendEmail({
      to: "agencias@antartur.tur.ar",
      subject: `Nueva Reserva - ${order.code}`,
      html,
      text,
      replyTo: order.customerEmail,
    });
  }
}

/**
 * Actualiza el estado de una orden
 */
export async function updateOrderStatus(orderId: string, newStatus: string) {
  const { ValidationError, NotFoundError } = await import("@/lib/api/errorHandler");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundError("Order", orderId);
  }

  // Validaciones de transición de estado
  if (order.status === "PAID" && newStatus !== "COMPLETED" && newStatus !== "CANCELLED") {
    throw new ValidationError("Cannot change status from PAID to " + newStatus);
  }

  if (order.status === "EXPIRED" || order.status === "CANCELLED") {
    throw new ValidationError(`Cannot change status from ${order.status}`);
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus as typeof order.status },
  });

  return updated;
}

/**
 * Genera link de WhatsApp para consultas
 */
export function generateWhatsAppLinkForEnquiry(order: {
  code: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  currency: string;
  notes: string | null;
  bookings?: Array<{
    numAdults: number;
    numChildren: number;
    departureDateSnapshot?: Date | string;
    tourNameSnapshot?: string;
    tourDeparture?: {
      departureDate: Date;
      tour?: {
        name: string;
      };
    };
  }>;
}): string {
  if (!order.bookings || order.bookings.length === 0) {
    return "";
  }

  const booking = order.bookings[0];
  const departure = booking.tourDeparture;
  const tourName = booking.tourNameSnapshot || departure?.tour?.name || "Excursión";
  const departureDate = booking.departureDateSnapshot 
    ? new Date(booking.departureDateSnapshot).toLocaleDateString("es-AR")
    : departure?.departureDate 
      ? new Date(departure.departureDate).toLocaleDateString("es-AR")
      : "Fecha no disponible";
  const totalPassengers = booking.numAdults + booking.numChildren;
  const totalAmount = Number(order.totalAmount).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const reason = order.notes?.includes("exceedsAvailability")
    ? "Excede disponibilidad"
    : order.notes?.includes("hasRestrictionViolations")
    ? "Restricciones"
    : "Consulta";

  const message = `Nueva consulta:\n` +
    `Cliente: ${order.customerName}\n` +
    `Pasajeros: ${totalPassengers} (${booking.numAdults} adultos, ${booking.numChildren} menores)\n` +
    `Excursión: ${tourName}\n` +
    `Fecha: ${departureDate}\n` +
    `Motivo: ${reason}\n` +
    `Total: ${order.currency === "USD" ? "$" : "$"} ${totalAmount}\n` +
    `Teléfono: ${order.customerPhone}`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/5492901487838?text=${encodedMessage}`;
}

