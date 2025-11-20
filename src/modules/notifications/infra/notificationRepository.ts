/**
 * Repositorio para acceso a datos de Notifications usando Prisma
 */

import { PrismaClient, NotificationStatus } from "@prisma/client";
import type { CreateNotificationInput } from "../domain/types";

const prisma = new PrismaClient();

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

  async updateStatus(id: string, status: NotificationStatus, sentAt?: Date, errorMessage?: string) {
    return prisma.notification.update({
      where: { id },
      data: {
        status,
        sentAt: sentAt || new Date(),
        errorMessage,
      },
    });
  }
}

