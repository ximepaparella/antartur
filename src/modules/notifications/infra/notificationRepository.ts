/**
 * Repositorio para acceso a datos de Notifications usando Prisma
 */

import { NotificationStatus } from "@prisma/client";
import type { CreateNotificationInput } from "../domain/types";
import { prisma } from "@/lib/db";

export class NotificationRepository {
  async findAll(orderId?: string) {
    return prisma.notification.findMany({
      where: orderId ? { orderId } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  async create(data: CreateNotificationInput) {
    return prisma.notification.create({
      data,
    });
  }

  async updateStatus(id: string, status: NotificationStatus, sentAt?: Date | null, errorMessage?: string | null) {
    const updateData: {
      status: NotificationStatus;
      sentAt?: Date | null;
      errorMessage?: string | null;
    } = {
      status,
    };
    
    // Solo incluir sentAt si se proporciona explícitamente (incluyendo null para limpiar)
    if (sentAt !== undefined) {
      updateData.sentAt = sentAt;
    }
    
    // Solo incluir errorMessage si se proporciona explícitamente
    if (errorMessage !== undefined) {
      updateData.errorMessage = errorMessage;
    }
    
    return prisma.notification.update({
      where: { id },
      data: updateData,
    });
  }
}

