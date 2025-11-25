/**
 * Servicio de dominio para gestionar notificaciones
 * Maneja el tracking, estados y reintentos de notificaciones
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/services/logger";
import type { NotificationType, NotificationStatus } from "@prisma/client";

export interface CreateNotificationInput {
  orderId?: string;
  type: NotificationType;
  recipient: string;
  templateKey: string;
  subject?: string;
  body?: string;
  maxRetries?: number;
}

export interface UpdateNotificationStatusInput {
  notificationId: string;
  status: NotificationStatus;
  errorMessage?: string;
}

/**
 * Calcula el próximo intento de reintento basado en el número de reintentos
 * Reintentos inmediatos: 2 intentos con delay de 5 segundos
 * Reintentos diferidos: 3 intentos con delays exponenciales (1h, 6h, 24h)
 */
function calculateNextRetryAt(retryCount: number): Date | null {
  // Reintentos inmediatos (0-1): 5 segundos
  if (retryCount < 2) {
    const nextRetry = new Date();
    nextRetry.setSeconds(nextRetry.getSeconds() + 5);
    return nextRetry;
  }

  // Reintentos diferidos (2-4): delays exponenciales
  const delays = [1, 6, 24]; // horas
  const delayIndex = retryCount - 2;

  if (delayIndex < delays.length) {
    const nextRetry = new Date();
    nextRetry.setHours(nextRetry.getHours() + delays[delayIndex]);
    return nextRetry;
  }

  // Máximo de reintentos alcanzado
  return null;
}

/**
 * Crea un registro de notificación antes de enviar
 */
export async function createNotification(input: CreateNotificationInput): Promise<string> {
  // Construir el objeto data - usar sintaxis explícita para evitar problemas de tipos
  const baseData = {
    type: input.type,
    recipient: input.recipient,
    templateKey: input.templateKey,
    subject: input.subject || null,
    body: input.body || null,
    status: "PENDING" as const,
    maxRetries: input.maxRetries ?? 5,
    retryCount: 0,
  };

  // Agregar orderId solo si está presente usando spread condicional
  const data = input.orderId
    ? { ...baseData, orderId: input.orderId }
    : baseData;

  const notification = await prisma.notification.create({
    data,
  });

  logger.info("Notification created", {
    notificationId: notification.id,
    orderId: input.orderId,
    type: input.type,
    recipient: input.recipient,
    templateKey: input.templateKey,
  });

  return notification.id;
}

/**
 * Actualiza el estado de una notificación después de enviar
 */
export async function updateNotificationStatus(
  input: UpdateNotificationStatusInput
): Promise<void> {
  const updateData: {
    status: NotificationStatus;
    errorMessage?: string | null;
    sentAt?: Date;
  } = {
    status: input.status,
  };

  if (input.status === "SENT") {
    updateData.sentAt = new Date();
    updateData.errorMessage = null;
  } else if (input.status === "ERROR" && input.errorMessage) {
    updateData.errorMessage = input.errorMessage;
  } else if (input.status === "ERROR") {
    updateData.errorMessage = null;
  }

  await prisma.notification.update({
    where: { id: input.notificationId },
    data: updateData,
  });

  logger.info("Notification status updated", {
    notificationId: input.notificationId,
    status: input.status,
    hasError: !!input.errorMessage,
  });
}

/**
 * Incrementa el contador de reintentos y calcula el próximo intento
 */
export async function incrementRetryCount(notificationId: string): Promise<{
  retryCount: number;
  nextRetryAt: Date | null;
  canRetry: boolean;
}> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new Error(`Notification ${notificationId} not found`);
  }

  const newRetryCount = notification.retryCount + 1;
  const canRetry = newRetryCount < notification.maxRetries;
  const nextRetryAt = canRetry ? calculateNextRetryAt(newRetryCount) : null;

  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      retryCount: newRetryCount,
      nextRetryAt,
      status: canRetry ? "PENDING" : "ERROR",
    },
  });

  logger.info("Notification retry count incremented", {
    notificationId,
    retryCount: newRetryCount,
    maxRetries: notification.maxRetries,
    canRetry,
    nextRetryAt,
  });

  return {
    retryCount: newRetryCount,
    nextRetryAt,
    canRetry,
  };
}

/**
 * Obtiene notificaciones fallidas que están listas para reintento
 */
export async function getFailedNotifications(): Promise<
  Array<{
    id: string;
    orderId: string | null;
    type: NotificationType;
    recipient: string;
    templateKey: string;
    subject: string | null;
    body: string | null;
    retryCount: number;
    maxRetries: number;
  }>
> {
  const now = new Date();

  const notifications = await prisma.notification.findMany({
    where: {
      status: "ERROR",
      retryCount: {
        lt: prisma.notification.fields.maxRetries,
      },
      OR: [
        { nextRetryAt: { lte: now } },
        { nextRetryAt: null },
      ],
    },
    select: {
      id: true,
      orderId: true,
      type: true,
      recipient: true,
      templateKey: true,
      subject: true,
      body: true,
      retryCount: true,
      maxRetries: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 100, // Limitar a 100 por ejecución para no sobrecargar
  });

  return notifications;
}

/**
 * Obtiene todas las notificaciones de una orden
 */
export async function getNotificationsByOrderId(orderId: string): Promise<
  Array<{
    id: string;
    type: NotificationType;
    recipient: string;
    templateKey: string;
    status: NotificationStatus;
    sentAt: Date | null;
    errorMessage: string | null;
    retryCount: number;
    createdAt: Date;
  }>
> {
  const notifications = await prisma.notification.findMany({
    where: { orderId },
    select: {
      id: true,
      type: true,
      recipient: true,
      templateKey: true,
      status: true,
      sentAt: true,
      errorMessage: true,
      retryCount: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notifications;
}
