/**
 * Controller para Orders
 * Maneja la lógica de validación, transformación y llamadas a servicios
 */

import { NextRequest } from "next/server";
import { OrderRepository } from "../../infra/orderRepository";
import { createReservation } from "../../domain/orderService";
import { TourRepository } from "@/modules/tours/infra/tourRepository";
import { validateQuery, validateBody } from "@/lib/validation/schemas";
import {
  createOrderSchema,
  listOrdersQuerySchema,
  updateOrderStatusSchema,
  type CreateOrderInput,
  type ListOrdersQuery,
  type UpdateOrderStatusInput,
} from "../validators/ordersValidators";
import {
  toOrderResponse,
  toOrderWithBookingsResponse,
  toOrderFullResponse,
} from "../dto/ordersDto";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { normalizePagination, calculatePaginationMeta } from "@/lib/api/response";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/modules/notifications/services/emailService";
import { generateReservationEmailHTML, generateReservationEmailText } from "@/modules/notifications/templates/reservationEmail";
import { generateEnquiryEmailHTML, generateEnquiryEmailText } from "@/modules/notifications/templates/enquiryEmail";
import { generateWhatsAppLink } from "@/lib/utils/whatsapp";

const orderRepository = new OrderRepository();
const tourRepository = new TourRepository();

export class OrdersController {
  /**
   * Crear una nueva orden/reserva
   * Usa el servicio createReservation que maneja toda la lógica de negocio
   */
  async create(body: unknown) {
    const data = validateBody(createOrderSchema, body);

    // Validar que el número de pasajeros coincida
    const totalPassengers = data.numAdults + data.numChildren;
    if (data.passengers.length !== totalPassengers) {
      throw new ValidationError(
        `Number of passengers (${data.passengers.length}) does not match adults + children (${totalPassengers})`
      );
    }

    // Validar que haya al menos un adulto si hay niños
    if (data.numChildren > 0 && data.numAdults === 0) {
      throw new ValidationError("At least one adult is required when booking for children");
    }

    // Si se proporciona departureId directamente, usarlo
    // Si no, buscar por tourId (slug), date y startTime
    let departureId = data.departureId;
    let tourId = data.tourId;

    if (!departureId && data.date && data.startTime) {
      // Buscar tour por slug si tourId es un slug
      const tour = await tourRepository.findBySlug(data.tourId);
      if (!tour) {
        throw new NotFoundError("Tour", data.tourId);
      }
      tourId = tour.id;

      // Buscar departure por tourId, date y startTime
      const departure = await prisma.tourDeparture.findFirst({
        where: {
          tourId: tour.id,
          departureDate: new Date(data.date),
          startTime: data.startTime,
        },
      });

      if (!departure) {
        throw new NotFoundError(
          "TourDeparture",
          `Tour ${data.tourId} on ${data.date} at ${data.startTime}`
        );
      }

      departureId = departure.id;
    } else if (!departureId) {
      throw new ValidationError("Either departureId or (tourId, date, startTime) must be provided");
    }

    // Mapear passengers al formato esperado por createReservation
    const passengers = data.passengers.map((p) => ({
      type: p.type as "ADULT" | "CHILD" | "INFANT",
      firstName: p.firstName,
      lastName: p.lastName,
      birthDate: p.birthDate ? new Date(p.birthDate) : undefined,
      documentType: p.documentType,
      documentNumber: p.documentNumber,
      nationality: p.nationality,
      email: p.email,
      phone: p.phone,
      restrictions: p.restrictions,
    }));

    // Crear reserva usando el servicio de dominio
    const result = await createReservation({
      tourId,
      departureId,
      numAdults: data.numAdults,
      numChildren: data.numChildren,
      currency: data.currency,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      passengers,
      notes: data.notes,
      paymentMethod: data.paymentMethod,
      exceedsAvailability: data.exceedsAvailability,
      hasRestrictionViolations: data.hasRestrictionViolations,
      additionals: data.additionals,
    });

    // Obtener la orden completa con relaciones usando Prisma directamente
    const order = await prisma.order.findUnique({
      where: { id: result.order.id },
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
        payments: true,
      },
    });
    if (!order) {
      throw new NotFoundError("Order", result.order.id);
    }

    // Enviar emails (no bloquear si falla)
    try {
      await sendOrderEmails(order);
    } catch (emailError) {
      console.error("Error al enviar emails de orden:", emailError);
      // No fallar la creación de la orden si el email falla
    }

    // Generar link de WhatsApp para consultas
    if (order.type === "ENQUIRY") {
      try {
        const whatsappLink = generateWhatsAppLinkForEnquiry(order);
        // El link se puede incluir en la respuesta o loguearse
        console.log("WhatsApp link para consulta:", whatsappLink);
      } catch (whatsappError) {
        console.error("Error al generar link de WhatsApp:", whatsappError);
      }
    }

    return toOrderFullResponse(order);
  }
}

/**
 * Envía emails de confirmación al cliente y copia a agencias@antartur.tur.ar
 */
async function sendOrderEmails(order: any) {
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
    const passengerList = passengers.map((p: any) => ({
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
 * Genera link de WhatsApp para consultas
 */
function generateWhatsAppLinkForEnquiry(order: any): string {
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

  /**
   * Listar órdenes con paginación y filtros
   */
  async list(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = validateQuery(listOrdersQuerySchema, Object.fromEntries(searchParams));

    const { page, limit, skip } = normalizePagination(query.page, query.limit);

    // Construir where clause
    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.customerEmail) {
      where.customerEmail = query.customerEmail;
    }

    // Obtener órdenes con paginación
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

    const meta = calculatePaginationMeta(page, limit, total);
    const data = orders.map(toOrderWithBookingsResponse);

    return { data, meta };
  }

  /**
   * Obtener orden por ID
   */
  async getById(id: string, includePayments = false) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError("Order", id);
    }

    if (includePayments) {
      return toOrderFullResponse(order);
    }

    return toOrderWithBookingsResponse(order);
  }

  /**
   * Obtener orden por código
   */
  async getByCode(code: string, includePayments = false) {
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
      throw new NotFoundError("Order", code);
    }

    if (includePayments) {
      return toOrderFullResponse(order);
    }

    return toOrderWithBookingsResponse(order);
  }

  /**
   * Actualizar estado de orden
   */
  async updateStatus(id: string, body: unknown) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError("Order", id);
    }

    const data = validateBody(updateOrderStatusSchema, body);

    // Validaciones de transición de estado
    if (order.status === "PAID" && data.status !== "COMPLETED" && data.status !== "CANCELLED") {
      throw new ValidationError("Cannot change status from PAID to " + data.status);
    }

    if (order.status === "EXPIRED" || order.status === "CANCELLED") {
      throw new ValidationError(`Cannot change status from ${order.status}`);
    }

    const updated = await orderRepository.updateStatus(id, data.status);
    return toOrderResponse(updated);
  }
}

