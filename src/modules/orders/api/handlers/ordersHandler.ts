/**
 * HTTP Handlers para Orders
 * Maneja requests HTTP y delega a controllers
 */

import { NextRequest } from "next/server";
import { OrdersController } from "../controllers/ordersController";
import { successResponse, createdResponse, paginatedResponse } from "@/lib/api/response";
import { withErrorHandler } from "@/lib/api/errorHandler";

const controller = new OrdersController();

export const ordersHandler = {
  /**
   * POST /api/orders - Crear orden/reserva
   */
  create: withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const order = await controller.create(body);
    return createdResponse(order);
  }),

  /**
   * GET /api/orders - Listar órdenes
   */
  list: withErrorHandler(async (request: NextRequest) => {
    const result = await controller.list(request);
    return paginatedResponse(result.data, result.meta);
  }),

  /**
   * GET /api/orders/:id - Obtener orden por ID
   */
  getById: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includePayments = searchParams.get("includePayments") === "true";

    const order = await controller.getById(id, includePayments);
    return successResponse(order);
  }),

  /**
   * GET /api/orders/code/:code - Obtener orden por código
   */
  getByCode: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ code: string }> }) => {
    const { code } = await params;
    const { searchParams } = new URL(request.url);
    const includePayments = searchParams.get("includePayments") === "true";

    const order = await controller.getByCode(code, includePayments);
    return successResponse(order);
  }),

  /**
   * PUT /api/orders/:id/status - Actualizar estado de orden
   */
  updateStatus: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await request.json();

    const order = await controller.updateStatus(id, body);
    return successResponse(order);
  }),
};

