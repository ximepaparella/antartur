/**
 * Repositorio para acceso a datos de Payments usando Prisma
 */

import { PaymentStatus } from "@prisma/client";
import type { CreatePaymentInput } from "../domain/types";
import { prisma } from "@/lib/db";

export class PaymentRepository {
  async findAll(orderId?: string) {
    return prisma.payment.findMany({
      where: orderId ? { orderId } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });
  }

  async findByProviderPaymentId(provider: string, providerPaymentId: string) {
    return prisma.payment.findFirst({
      where: {
        provider,
        providerPaymentId,
      },
    });
  }

  async create(data: CreatePaymentInput) {
    return prisma.payment.create({
      data: {
        ...data,
        paidAt: data.paidAt,
        rawRequest: data.rawRequest ? JSON.parse(JSON.stringify(data.rawRequest)) : null,
        rawResponse: data.rawResponse ? JSON.parse(JSON.stringify(data.rawResponse)) : null,
      },
    });
  }

  async updateStatus(id: string, status: PaymentStatus, paidAt?: Date | null) {
    const updateData: { status: PaymentStatus; paidAt?: Date | null } = {
      status,
    };
    
    // Solo incluir paidAt si se proporciona explícitamente (incluyendo null para limpiar)
    if (paidAt !== undefined) {
      updateData.paidAt = paidAt;
    }
    
    return prisma.payment.update({
      where: { id },
      data: updateData,
    });
  }
}

