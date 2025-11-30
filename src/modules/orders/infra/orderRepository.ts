/**
 * Repositorio para acceso a datos de Orders usando Prisma
 */

import { OrderStatus } from "@prisma/client";
import type { CreateOrderInput } from "../domain/types";
import { prisma } from "@/lib/db";

export class OrderRepository {
  async findAll() {
    return prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        bookings: true,
        payments: true,
        notifications: true,
      },
    });
  }

  async findByCode(code: string) {
    return prisma.order.findUnique({
      where: { code },
      include: {
        bookings: true,
        payments: true,
      },
    });
  }

  async findPendingExpired() {
    return prisma.order.findMany({
      where: {
        status: "PENDING_PAYMENT",
        expiresAt: {
          lt: new Date(),
        },
      },
      include: {
        bookings: true,
      },
    });
  }

  async create(data: CreateOrderInput & { code: string }) {
    return prisma.order.create({
      data,
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async update(id: string, data: Partial<CreateOrderInput>) {
    return prisma.order.update({
      where: { id },
      data,
    });
  }
}

