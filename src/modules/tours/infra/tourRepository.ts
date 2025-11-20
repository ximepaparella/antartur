/**
 * Repositorio para acceso a datos de Tours usando Prisma
 */

import type { CreateTourInput, UpdateTourInput } from "../domain/types";
import { prisma } from "@/lib/db";

export class TourRepository {
  async findAll(includeImages = false, includeDepartures = false) {
    return prisma.tour.findMany({
      include: {
        images: includeImages,
        departures: includeDepartures,
      },
    });
  }

  async findById(id: string, includeImages = false, includeDepartures = false) {
    return prisma.tour.findUnique({
      where: { id },
      include: {
        images: includeImages,
        departures: includeDepartures,
      },
    });
  }

  async findBySlug(slug: string, includeImages = false, includeDepartures = false) {
    return prisma.tour.findUnique({
      where: { slug },
      include: {
        images: includeImages,
        departures: includeDepartures,
      },
    });
  }

  async create(data: CreateTourInput) {
    return prisma.tour.create({
      data,
    });
  }

  async update(id: string, data: UpdateTourInput) {
    return prisma.tour.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.tour.delete({
      where: { id },
    });
  }
}

