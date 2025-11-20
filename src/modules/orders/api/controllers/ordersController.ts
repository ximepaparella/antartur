/**
 * Controller para Orders
 * Maneja la lógica de validación, transformación y llamadas a servicios
 */

import { NextRequest } from "next/server";
import { OrderRepository } from "../../infra/orderRepository";
import { createReservation } from "../../domain/orderService";
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

const orderRepository = new OrderRepository();

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
      tourId: data.tourId,
      departureId: data.departureId,
      numAdults: data.numAdults,
      numChildren: data.numChildren,
      currency: data.currency,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      passengers,
      notes: data.notes,
    });

    // Obtener la orden completa con relaciones usando Prisma directamente
    const order = await prisma.order.findUnique({
      where: { id: result.order.id },
      include: {
        bookings: {
          include: {
            passengers: true,
          },
        },
        payments: true,
      },
    });
    if (!order) {
      throw new NotFoundError("Order", result.order.id);
    }

    return toOrderFullResponse(order);
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

