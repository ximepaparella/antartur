/**
 * Controller para Orders
 * Solo orquesta: valida entrada, llama servicios, transforma salida
 */

import { NextRequest } from "next/server";
import {
  createReservation,
  findDepartureByTourDateAndTime,
  validatePassengerCount,
  validateAdultRequired,
  getOrderWithRelations,
  listOrders,
  getOrderByCode,
  updateOrderStatus,
  sendOrderEmails,
  generateWhatsAppLinkForEnquiry,
} from "../../domain/orderService";
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
import { OrderRepository } from "../../infra/orderRepository";
import { logger } from "@/lib/services/logger";
import { parseDateKeyToLocalDate } from "@/lib/utils/dateTimeAr";

const orderRepository = new OrderRepository();

export class OrdersController {
  /**
   * Crear una nueva orden/reserva
   */
  async create(body: unknown) {
    const data = validateBody(createOrderSchema, body);

    // Validaciones de negocio (delegadas al servicio)
    validatePassengerCount(data.passengers, data.numAdults, data.numChildren);
    validateAdultRequired(data.numAdults, data.numChildren);

    // Resolver departureId y tourId
    let departureId = data.departureId;
    let tourId = data.tourId;

    if (!departureId && data.date && data.startTime) {
      const result = await findDepartureByTourDateAndTime(data.tourId, data.date, data.startTime);
      departureId = result.departureId;
      tourId = result.tourId;
    } else if (!departureId) {
      throw new ValidationError("Either departureId or (tourId, date, startTime) must be provided");
    }

    // Mapear passengers al formato esperado por createReservation
    const passengers = data.passengers.map((p) => ({
      type: p.type as "ADULT" | "CHILD" | "INFANT",
      firstName: p.firstName,
      lastName: p.lastName,
      birthDate: p.birthDate ? parseDateKeyToLocalDate(p.birthDate) : undefined,
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
      numInfants: data.numInfants || 0,
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

    // Obtener la orden completa con relaciones
    const order = await getOrderWithRelations(result.order.id, true);

    // Enviar emails (no bloquear si falla)
    try {
      logger.info("Attempting to send order emails", {
        orderId: order.id,
        orderCode: order.code,
        orderType: order.type,
        customerEmail: order.customerEmail,
      });

      // Convertir Decimal a number para sendOrderEmails
      await sendOrderEmails({
        ...order,
        totalAmount: Number(order.totalAmount),
      });

      logger.info("Order emails sent successfully", {
        orderId: order.id,
        orderCode: order.code,
        orderType: order.type,
        customerEmail: order.customerEmail,
        note: "Notifications are tracked in database and will be retried automatically if failed",
      });
    } catch (emailError) {
      const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
      logger.error("Error sending order emails - notifications will be retried automatically", {
        error: emailError,
        orderId: order.id,
        orderCode: order.code,
        orderType: order.type,
        customerEmail: order.customerEmail,
        errorMessage,
        note: "Order creation succeeded, but email notifications failed. They will be retried by cron job.",
      });
      // No fallar la creación de la orden si el email falla
      // Las notificaciones fallidas serán reintentadas automáticamente por el cron job
    }

    // Generar link de WhatsApp para consultas
    if (order.type === "ENQUIRY") {
      try {
        // Convertir Decimal a number para generateWhatsAppLinkForEnquiry
        const whatsappLink = generateWhatsAppLinkForEnquiry({
          ...order,
          totalAmount: Number(order.totalAmount),
        });
        logger.info("WhatsApp link para consulta generado", { orderCode: order.code });
      } catch (whatsappError) {
        logger.error("Error al generar link de WhatsApp", whatsappError);
      }
    }

    return toOrderFullResponse(order);
  }

  /**
   * Listar órdenes con paginación y filtros
   */
  async list(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = validateQuery(listOrdersQuerySchema, Object.fromEntries(searchParams));

    const result = await listOrders({
      status: query.status,
      type: query.type,
      customerEmail: query.customerEmail,
      page: query.page,
      limit: query.limit,
    });

    const meta = calculatePaginationMeta(result.page, result.limit, result.total);
    const data = result.data.map(toOrderWithBookingsResponse);

    return { data, meta };
  }

  /**
   * Obtener orden por ID
   */
  async getById(id: string, includePayments = false) {
    const order = await getOrderWithRelations(id, includePayments);

    if (includePayments) {
      return toOrderFullResponse(order);
    }

    return toOrderWithBookingsResponse(order);
  }

  /**
   * Obtener orden por código
   */
  async getByCode(code: string, includePayments = false) {
    const order = await getOrderByCode(code, includePayments);

    if (includePayments) {
      return toOrderFullResponse(order);
    }

    return toOrderWithBookingsResponse(order);
  }

  /**
   * Actualizar estado de orden
   */
  async updateStatus(id: string, body: unknown) {
    const data = validateBody(updateOrderStatusSchema, body);
    const updated = await updateOrderStatus(id, data.status);
    return toOrderResponse(updated);
  }
}

