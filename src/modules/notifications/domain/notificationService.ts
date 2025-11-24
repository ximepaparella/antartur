/**
 * Servicio de dominio para Notifications
 * Contiene la lógica de negocio para notificaciones
 */

import { NotificationRepository } from "../infra/notificationRepository";
import { OrderRepository } from "../../orders/infra/orderRepository";
import { NotFoundError } from "@/lib/api/errorHandler";
import type { CreateNotificationInput } from "../api/validators/notificationsValidators";

const notificationRepository = new NotificationRepository();
const orderRepository = new OrderRepository();

export class NotificationService {
  /**
   * Obtener notification por ID
   */
  async getNotificationById(id: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundError("Notification", id);
    }
    return notification;
  }

  /**
   * Obtener notifications de una orden
   */
  async getNotificationsByOrderId(orderId: string) {
    // Validación de negocio: verificar que la orden existe
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order", orderId);
    }

    const notifications = await notificationRepository.findAll(orderId);
    return notifications;
  }

  /**
   * Crear notification
   */
  async createNotification(data: CreateNotificationInput) {
    // Validación de negocio: si hay orderId, verificar que existe
    if (data.orderId) {
      const order = await orderRepository.findById(data.orderId);
      if (!order) {
        throw new NotFoundError("Order", data.orderId);
      }
    }

    const notification = await notificationRepository.create(data);
    return notification;
  }
}

