/**
 * Repositorio para acceso a datos de TourRestriction usando Prisma
 */

import { prisma } from "@/lib/db";

export interface TourRestrictionData {
  text: string;
  sortOrder?: number;
}

export class TourRestrictionRepository {
  async findByTourId(tourId: string) {
    return prisma.tourRestriction.findMany({
      where: { tourId },
      orderBy: { sortOrder: "asc" },
    });
  }

  async create(tourId: string, data: TourRestrictionData) {
    return prisma.tourRestriction.create({
      data: {
        tourId,
        text: data.text,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async createMany(tourId: string, items: TourRestrictionData[]) {
    if (items.length === 0) return [];
    
    return prisma.tourRestriction.createMany({
      data: items.map((item, index) => ({
        tourId,
        text: item.text,
        sortOrder: item.sortOrder ?? index,
      })),
    });
  }

  async deleteByTourId(tourId: string) {
    return prisma.tourRestriction.deleteMany({
      where: { tourId },
    });
  }

  async update(id: string, data: Partial<TourRestrictionData>) {
    return prisma.tourRestriction.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.tourRestriction.delete({
      where: { id },
    });
  }
}
