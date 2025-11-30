/**
 * Data Transfer Objects (DTOs) para Notifications
 */

import type { Notification as PrismaNotification } from "@prisma/client";

/**
 * DTO de respuesta para Notification
 */
export interface NotificationResponse {
  id: string;
  orderId: string | null;
  type: string;
  recipient: string;
  templateKey: string;
  subject: string | null;
  body: string | null;
  status: string;
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
}

/**
 * Transforma un Notification de Prisma a NotificationResponse
 */
export function toNotificationResponse(notification: PrismaNotification): NotificationResponse {
  return {
    id: notification.id,
    orderId: notification.orderId,
    type: notification.type,
    recipient: notification.recipient,
    templateKey: notification.templateKey,
    subject: notification.subject,
    body: notification.body,
    status: notification.status,
    errorMessage: notification.errorMessage,
    sentAt: notification.sentAt?.toISOString() || null,
    createdAt: notification.createdAt.toISOString(),
  };
}

