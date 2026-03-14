/**
 * Repositorio para acceso a datos de Departures usando Prisma
 */

import type { CreateDepartureInput, UpdateDepartureInput } from "../domain/types";
import { prisma } from "@/lib/db";

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
        tourId: data.tourId,
        departureDate: data.departureDate,
        seatsTotal: data.seatsTotal,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, data: UpdateDepartureInput) {
    const updateData: Record<string, unknown> = {};
    if (data.tourId !== undefined) updateData.tourId = data.tourId;
    if (data.departureDate !== undefined) updateData.departureDate = data.departureDate;
    if (data.seatsTotal !== undefined) updateData.seatsTotal = data.seatsTotal;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.tourDeparture.update({
      where: { id },
      data: updateData,
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

