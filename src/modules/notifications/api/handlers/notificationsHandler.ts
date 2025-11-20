/**
 * HTTP Handlers para Notifications
 * Maneja requests HTTP y delega a controllers
 */

import { NextRequest } from "next/server";
import { NotificationsController } from "../controllers/notificationsController";
import { successResponse, createdResponse } from "@/lib/api/response";
import { withErrorHandler } from "@/lib/api/errorHandler";

const controller = new NotificationsController();

export const notificationsHandler = {
  /**
   * GET /api/notifications/:id - Obtener notification por ID
   */
  getById: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const notification = await controller.getById(id);
    return successResponse(notification);
  }),

  /**
   * GET /api/notifications/order/:orderId - Obtener notifications de una orden
   */
  getByOrderId: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) => {
    const { orderId } = await params;
    const notifications = await controller.getByOrderId(orderId);
    return successResponse(notifications);
  }),

  /**
   * POST /api/notifications - Crear notification
   */
  create: withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const notification = await controller.create(body);
    return createdResponse(notification);
  }),
};

