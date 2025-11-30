/**
 * Repositorio para acceso a datos de Passengers usando Prisma
 */

import type { CreatePassengerInput } from "../domain/types";
import { prisma } from "@/lib/db";

export class PassengerRepository {
  async findAll(bookingId?: string) {
    return prisma.passenger.findMany({
      where: bookingId ? { bookingId } : undefined,
    });
  }

  async findById(id: string) {
    return prisma.passenger.findUnique({
      where: { id },
    });
  }

  async create(data: CreatePassengerInput) {
    return prisma.passenger.create({
      data: {
        ...data,
        birthDate: data.birthDate,
        restrictions: data.restrictions ? JSON.parse(JSON.stringify(data.restrictions)) : null,
      },
    });
  }

  async createMany(data: CreatePassengerInput[]) {
    return prisma.passenger.createMany({
      data: data.map((p) => ({
        ...p,
        birthDate: p.birthDate,
        restrictions: p.restrictions ? JSON.parse(JSON.stringify(p.restrictions)) : null,
      })),
    });
  }

  async update(id: string, data: Partial<CreatePassengerInput>) {
    return prisma.passenger.update({
      where: { id },
      data: {
        ...data,
        birthDate: data.birthDate,
        restrictions: data.restrictions ? JSON.parse(JSON.stringify(data.restrictions)) : null,
      },
    });
  }

  async delete(id: string) {
    return prisma.passenger.delete({
      where: { id },
    });
  }
}

