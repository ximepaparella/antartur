/**
 * Controller para Notifications
 * Solo orquesta: valida entrada, llama servicios, transforma salida
 */

import { NotificationService } from "../../domain/notificationService";
import { validateBody } from "@/lib/validation/schemas";
import {
  createNotificationSchema,
  type CreateNotificationInput,
} from "../validators/notificationsValidators";
import { toNotificationResponse } from "../dto/notificationsDto";

const notificationService = new NotificationService();

export class NotificationsController {
  /**
   * Obtener notification por ID
   */
  async getById(id: string) {
    const notification = await notificationService.getNotificationById(id);
    return toNotificationResponse(notification);
  }

  /**
   * Obtener notifications de una orden
   */
  async getByOrderId(orderId: string) {
    const notifications = await notificationService.getNotificationsByOrderId(orderId);
    return notifications.map(toNotificationResponse);
  }

  /**
   * Crear notification
   */
  async create(body: unknown) {
    const data = validateBody(createNotificationSchema, body);
    const notification = await notificationService.createNotification(data);
    return toNotificationResponse(notification);
  }
}

