/**
 * Tipos de dominio para Notifications
 */

import type { NotificationType, NotificationStatus } from "@prisma/client";

export type { NotificationType, NotificationStatus };

export interface Notification {
  id: string;
  orderId?: string | null;
  type: NotificationType;
  recipient: string;
  templateKey: string;
  subject?: string | null;
  body?: string | null;
  status: NotificationStatus;
  errorMessage?: string | null;
  sentAt?: Date | null;
  createdAt: Date;
}

export interface CreateNotificationInput {
  orderId?: string;
  type: NotificationType;
  recipient: string;
  templateKey: string;
  subject?: string;
  body?: string;
  status?: NotificationStatus;
}

