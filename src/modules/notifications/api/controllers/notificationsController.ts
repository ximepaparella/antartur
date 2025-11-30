/**
 * Controller para Notifications
 * Solo orquesta: valida entrada, llama servicios, transforma salida
 */

import { NextRequest } from "next/server";
import {
  createNotification,
  getNotificationsByOrderId,
} from "../../domain/notificationService";
import { validateBody, validateQuery } from "@/lib/validation/schemas";
import {
  createNotificationSchema,
  type CreateNotificationInput,
} from "../validators/notificationsValidators";
import { toNotificationResponse } from "../dto/notificationsDto";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/api/errorHandler";
import { calculatePaginationMeta } from "@/lib/api/response";
import { z } from "zod";

const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  type: z.enum(["EMAIL", "WHATSAPP"]).optional(),
  status: z.enum(["PENDING", "SENT", "ERROR"]).optional(),
  orderId: z.string().optional(),
});

export class NotificationsController {
  /**
   * Listar notifications con paginación y filtros
   */
  async list(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = validateQuery(listNotificationsQuerySchema, Object.fromEntries(searchParams));

    const where: Record<string, unknown> = {};
    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.orderId) {
      where.orderId = query.orderId;
    }

    const skip = (query.page - 1) * query.limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);

    const meta = calculatePaginationMeta(query.page, query.limit, total);
    const data = notifications.map(toNotificationResponse);

    return { data, meta };
  }

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

