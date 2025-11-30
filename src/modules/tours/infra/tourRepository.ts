/**
 * Repositorio para acceso a datos de Tours usando Prisma
 */

import type { CreateTourInput, UpdateTourInput } from "../domain/types";
import { prisma } from "@/lib/db";

export class TourRepository {
  async findAll(
    includeImages = false,
    includeDepartures = false,
    includePrices = false,
    includeAdditionals = false,
    includeContent = false
  ) {
    return prisma.tour.findMany({
      include: {
        images: includeImages,
        departures: includeDepartures
          ? {
              where: {
                isActive: true,
                departureDate: {
                  gte: new Date(), // Solo fechas futuras
                },
              },
              orderBy: [
                { departureDate: "asc" },
                { startTime: "asc" },
              ],
            }
          : false,
        prices: includePrices,
        additionals: includeAdditionals
          ? {
              where: { isActive: true },
              include: {
                prices: true,
              },
              orderBy: { sortOrder: "asc" },
            }
          : false,
        timelineItems: includeContent
          ? {
              orderBy: { sortOrder: "asc" },
            }
          : false,
        featuredInfos: includeContent
          ? {
              orderBy: { sortOrder: "asc" },
            }
          : false,
        testimonials: includeContent
          ? {
              orderBy: { sortOrder: "asc" },
            }
          : false,
        quickInfoItems: includeContent
          ? {
              orderBy: { sortOrder: "asc" },
            }
          : false,
      },
    });
  }

  async findById(
    id: string,
    includeImages = false,
    includeDepartures = false,
    includePrices = false,
    includeAdditionals = false,
    includeContent = false
  ) {
    return prisma.tour.findUnique({
      where: { id },
      include: {
        images: includeImages,
        departures: includeDepartures
          ? {
              where: {
                isActive: true,
                departureDate: {
                  gte: new Date(), // Solo fechas futuras
                },
              },
              orderBy: [
                { departureDate: "asc" },
                { startTime: "asc" },
              ],
            }
          : false,
        prices: includePrices,
        additionals: includeAdditionals
          ? {
              where: { isActive: true },
              include: {
                prices: true,
              },
              orderBy: { sortOrder: "asc" },
            }
          : false,
        timelineItems: includeContent
          ? {
              orderBy: { sortOrder: "asc" },
            }
          : false,
        featuredInfos: includeContent
          ? {
              orderBy: { sortOrder: "asc" },
            }
          : false,
        testimonials: includeContent
          ? {
              orderBy: { sortOrder: "asc" },
            }
          : false,
        quickInfoItems: includeContent
          ? {
              orderBy: { sortOrder: "asc" },
            }
          : false,
      },
    });
  }

  async findBySlug(
    slug: string,
    includeImages = false,
    includeDepartures = false,
    includePrices = false,
    includeAdditionals = false,
    includeContent = false
  ) {
    return prisma.tour.findUnique({
      where: { slug },
      include: {
        images: includeImages,
        departures: includeDepartures
          ? {
              where: {
                isActive: true,
                departureDate: {
                  gte: new Date(), // Solo fechas futuras
                },
              },
              orderBy: [
                { departureDate: "asc" },
                { startTime: "asc" },
              ],
            }
          : false,
        prices: includePrices,
        additionals: includeAdditionals
          ? {
              where: { isActive: true },
              include: {
                prices: true,
              },
              orderBy: { sortOrder: "asc" },
            }
          : false,
        timelineItems: includeContent
          ? {
              orderBy: { sortOrder: "asc" },
            }
          : false,
        featuredInfos: includeContent
          ? {
              orderBy: { sortOrder: "asc" },
            }
          : false,
        testimonials: includeContent
          ? {
              orderBy: { sortOrder: "asc" },
            }
          : false,
        quickInfoItems: includeContent
          ? {
              orderBy: { sortOrder: "asc" },
            }
          : false,
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

