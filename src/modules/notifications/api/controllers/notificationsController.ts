/**
 * Controller para Notifications
 * Maneja la lógica de validación, transformación y llamadas a servicios
 */

import { NotificationRepository } from "../../infra/notificationRepository";
import { OrderRepository } from "../../../orders/infra/orderRepository";
import { validateBody } from "@/lib/validation/schemas";
import {
  createNotificationSchema,
  type CreateNotificationInput,
} from "../validators/notificationsValidators";
import { toNotificationResponse } from "../dto/notificationsDto";
import { NotFoundError } from "@/lib/api/errorHandler";

const notificationRepository = new NotificationRepository();
const orderRepository = new OrderRepository();

export class NotificationsController {
  /**
   * Obtener notification por ID
   */
  async getById(id: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundError("Notification", id);
    }

    return toNotificationResponse(notification);
  }

  /**
   * Obtener notifications de una orden
   */
  async getByOrderId(orderId: string) {
    // Verificar que la orden existe
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order", orderId);
    }

    const notifications = await notificationRepository.findAll(orderId);
    return notifications.map(toNotificationResponse);
  }

  /**
   * Crear notification
   */
  async create(body: unknown) {
    const data = validateBody(createNotificationSchema, body);

    // Si hay orderId, verificar que existe
    if (data.orderId) {
      const order = await orderRepository.findById(data.orderId);
      if (!order) {
        throw new NotFoundError("Order", data.orderId);
      }
    }

    const notification = await notificationRepository.create(data);
    return toNotificationResponse(notification);
  }
}

