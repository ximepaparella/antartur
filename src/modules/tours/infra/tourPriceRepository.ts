/**
 * Repositorio para acceso a datos de TourPrice usando Prisma
 */

import { prisma } from "@/lib/db";
import type { CreateTourPriceInput, UpdateTourPriceInput } from "../domain/types";

export class TourPriceRepository {
  /**
   * Encuentra todos los precios de un tour, opcionalmente filtrado por moneda
   */
  async findByTourId(tourId: string, currency?: string) {
    return prisma.tourPrice.findMany({
      where: {
        tourId,
        ...(currency ? { currency } : {}),
      },
      include: {
        currencyRef: true,
      },
      orderBy: {
        currency: "asc",
      },
    });
  }

  /**
   * Encuentra un precio específico por tour y moneda
   */
  async findByTourIdAndCurrency(tourId: string, currency: string) {
    return prisma.tourPrice.findUnique({
      where: {
        tourId_currency: {
          tourId,
          currency,
        },
      },
      include: {
        currencyRef: true,
      },
    });
  }

  /**
   * Encuentra un precio por su ID
   */
  async findById(id: string) {
    return prisma.tourPrice.findUnique({
      where: { id },
      include: {
        currencyRef: true,
        tour: true,
      },
    });
  }

  /**
   * Crea un nuevo precio para un tour
   */
  async create(data: CreateTourPriceInput) {
    return prisma.tourPrice.create({
      data: {
        tourId: data.tourId,
        currency: data.currency,
        priceAdult: data.priceAdult,
        priceChild: data.priceChild,
      },
      include: {
        currencyRef: true,
      },
    });
  }

  /**
   * Actualiza un precio existente
   */
  async update(id: string, data: UpdateTourPriceInput) {
    return prisma.tourPrice.update({
      where: { id },
      data: {
        ...(data.priceAdult !== undefined ? { priceAdult: data.priceAdult } : {}),
        ...(data.priceChild !== undefined ? { priceChild: data.priceChild } : {}),
      },
      include: {
        currencyRef: true,
      },
    });
  }

  /**
   * Actualiza o crea un precio (upsert)
   */
  async upsert(tourId: string, currency: string, data: CreateTourPriceInput) {
    return prisma.tourPrice.upsert({
      where: {
        tourId_currency: {
          tourId,
          currency,
        },
      },
      update: {
        priceAdult: data.priceAdult,
        priceChild: data.priceChild,
      },
      create: {
        tourId: data.tourId,
        currency: data.currency,
        priceAdult: data.priceAdult,
        priceChild: data.priceChild,
      },
      include: {
        currencyRef: true,
      },
    });
  }

  /**
   * Elimina un precio por su ID
   */
  async delete(id: string) {
    return prisma.tourPrice.delete({
      where: { id },
    });
  }

  /**
   * Elimina un precio por tour y moneda
   */
  async deleteByTourIdAndCurrency(tourId: string, currency: string) {
    return prisma.tourPrice.delete({
      where: {
        tourId_currency: {
          tourId,
          currency,
        },
      },
    });
  }
}

