/**
 * Servicio de dominio para TourPrices
 * Contiene la lógica de negocio para precios de tours
 */

import { TourPriceRepository } from "../infra/tourPriceRepository";
import { TourRepository } from "../infra/tourRepository";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { prisma } from "@/lib/db";
import type { CreateTourPriceInput, UpdateTourPriceInput } from "../api/validators/tourPricesValidators";

const tourPriceRepository = new TourPriceRepository();
const tourRepository = new TourRepository();

export class TourPriceService {
  /**
   * Lista todos los precios de un tour
   */
  async listPricesByTourId(tourId: string) {
    // Validación de negocio: verificar que el tour existe
    const tour = await tourRepository.findById(tourId);
    if (!tour) {
      throw new NotFoundError("Tour", tourId);
    }

    const prices = await tourPriceRepository.findByTourId(tourId);
    return prices;
  }

  /**
   * Obtiene un precio específico por tour y moneda
   */
  async getPriceByTourIdAndCurrency(tourId: string, currency: string) {
    // Validación de negocio: verificar que el tour existe
    const tour = await tourRepository.findById(tourId);
    if (!tour) {
      throw new NotFoundError("Tour", tourId);
    }

    // Validación de negocio: verificar que la moneda existe
    const currencyExists = await prisma.currency.findUnique({
      where: { code: currency },
    });
    if (!currencyExists) {
      throw new ValidationError(`Currency '${currency}' not found`);
    }

    const price = await tourPriceRepository.findByTourIdAndCurrency(tourId, currency);
    if (!price) {
      throw new NotFoundError("TourPrice", `${tourId}-${currency}`);
    }

    return price;
  }

  /**
   * Crea un nuevo precio para un tour
   */
  async createPrice(data: CreateTourPriceInput) {
    // Validación de negocio: verificar que el tour existe
    const tour = await tourRepository.findById(data.tourId);
    if (!tour) {
      throw new NotFoundError("Tour", data.tourId);
    }

    // Validación de negocio: verificar que la moneda existe
    const currency = await prisma.currency.findUnique({
      where: { code: data.currency },
    });
    if (!currency) {
      throw new ValidationError(`Currency '${data.currency}' not found`);
    }

    // Validación de negocio: verificar que no existe ya un precio para este tour y moneda
    const existingPrice = await tourPriceRepository.findByTourIdAndCurrency(
      data.tourId,
      data.currency
    );
    if (existingPrice) {
      throw new ValidationError(
        `Price already exists for tour ${data.tourId} in currency ${data.currency}`
      );
    }

    const newPrice = await tourPriceRepository.create(data);
    return newPrice;
  }

  /**
   * Actualiza un precio existente
   */
  async updatePrice(id: string, data: UpdateTourPriceInput) {
    const existingPrice = await tourPriceRepository.findById(id);
    if (!existingPrice) {
      throw new NotFoundError("TourPrice", id);
    }

    const updatedPrice = await tourPriceRepository.update(id, data);
    return updatedPrice;
  }

  /**
   * Elimina un precio
   */
  async deletePrice(id: string) {
    const existingPrice = await tourPriceRepository.findById(id);
    if (!existingPrice) {
      throw new NotFoundError("TourPrice", id);
    }

    await tourPriceRepository.delete(id);
  }
}

