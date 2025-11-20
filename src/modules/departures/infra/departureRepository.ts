/**
 * Repositorio para acceso a datos de Departures usando Prisma
 */

import { PrismaClient } from "@prisma/client";
import type { CreateDepartureInput, UpdateDepartureInput } from "../domain/types";

const prisma = new PrismaClient();

export class DepartureRepository {
  async findAll(tourId?: string) {
    return prisma.tourDeparture.findMany({
      where: tourId ? { tourId } : undefined,
      orderBy: {
        departureDate: "asc",
      },
    });
  }

  async findById(id: string) {
    return prisma.tourDeparture.findUnique({
      where: { id },
    });
  }

  /**
   * Bloquea un departure para actualización (SELECT FOR UPDATE)
   * Usado para prevenir condiciones de carrera al reservar cupos
   */
  async lockForUpdate(id: string) {
    return prisma.$queryRaw`
      SELECT * FROM "TourDeparture"
      WHERE id = ${id}
      FOR UPDATE
    `;
  }

  async create(data: CreateDepartureInput) {
    return prisma.tourDeparture.create({
      data: {
        ...data,
        departureDate: data.departureDate,
      },
    });
  }

  async update(id: string, data: UpdateDepartureInput) {
    return prisma.tourDeparture.update({
      where: { id },
      data: {
        ...data,
        departureDate: data.departureDate,
      },
    });
  }

  /**
   * Actualiza los cupos de un departure
   */
  async updateSeats(
    id: string,
    seatsHeld: number,
    seatsConfirmed: number
  ) {
    return prisma.tourDeparture.update({
      where: { id },
      data: {
        seatsHeld,
        seatsConfirmed,
      },
    });
  }

  async delete(id: string) {
    return prisma.tourDeparture.delete({
      where: { id },
    });
  }
}

