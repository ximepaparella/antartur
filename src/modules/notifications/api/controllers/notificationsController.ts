/**
 * Controller para Notifications
 * Solo orquesta: valida entrada, llama servicios, transforma salida
 */

import {
  createNotification,
  getNotificationsByOrderId,
} from "../../domain/notificationService";
import { validateBody } from "@/lib/validation/schemas";
import {
  createNotificationSchema,
  type CreateNotificationInput,
} from "../validators/notificationsValidators";
import { toNotificationResponse } from "../dto/notificationsDto";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/api/errorHandler";

export class NotificationsController {
  /**
   * Obtener notification por ID
   */
  async getById(id: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundError("Notification", id);
    }

    return toNotificationResponse(notification);
  }

  /**
   * Obtener notifications de una orden
   */
  async getByOrderId(orderId: string) {
    const notifications = await getNotificationsByOrderId(orderId);
    
    // Obtener notificaciones completas desde BD para tener todos los campos
    const fullNotifications = await prisma.notification.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
    
    return fullNotifications.map(toNotificationResponse);
  }

  /**
   * Crear notification
   */
  async create(body: unknown) {
    const data = validateBody(createNotificationSchema, body);
    const notificationId = await createNotification(data);
    
    // Obtener la notificación creada para retornarla
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error("Failed to retrieve created notification");
    }

    return toNotificationResponse(notification);
  }
}

