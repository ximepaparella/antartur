/**
 * Controller para TourPrices
 * Maneja la lógica de validación, transformación y llamadas a servicios
 */

import { TourPriceRepository } from "../../infra/tourPriceRepository";
import { TourRepository } from "../../infra/tourRepository";
import {
  toTourPriceResponse,
  type TourPriceResponse,
} from "../dto/tourPriceDto";
import {
  CreateTourPriceInput,
  UpdateTourPriceInput,
} from "../validators/tourPricesValidators";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { prisma } from "@/lib/db";

const tourPriceRepository = new TourPriceRepository();
const tourRepository = new TourRepository();

export class TourPricesController {
  /**
   * Lista todos los precios de un tour
   */
  async listByTourId(tourId: string): Promise<TourPriceResponse[]> {
    // Verificar que el tour existe
    const tour = await tourRepository.findById(tourId);
    if (!tour) {
      throw new NotFoundError("Tour", tourId);
    }

    const prices = await tourPriceRepository.findByTourId(tourId);
    return prices.map(toTourPriceResponse);
  }

  /**
   * Obtiene un precio específico por tour y moneda
   */
  async getByTourIdAndCurrency(tourId: string, currency: string): Promise<TourPriceResponse> {
    // Verificar que el tour existe
    const tour = await tourRepository.findById(tourId);
    if (!tour) {
      throw new NotFoundError("Tour", tourId);
    }

    // Verificar que la moneda existe
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

    return toTourPriceResponse(price);
  }

  /**
   * Crea un nuevo precio para un tour
   */
  async create(data: CreateTourPriceInput): Promise<TourPriceResponse> {
    // Verificar que el tour existe
    const tour = await tourRepository.findById(data.tourId);
    if (!tour) {
      throw new NotFoundError("Tour", data.tourId);
    }

    // Verificar que la moneda existe
    const currency = await prisma.currency.findUnique({
      where: { code: data.currency },
    });
    if (!currency) {
      throw new ValidationError(`Currency '${data.currency}' not found`);
    }

    // Verificar que no existe ya un precio para este tour y moneda
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
    return toTourPriceResponse(newPrice);
  }

  /**
   * Actualiza un precio existente
   */
  async update(id: string, data: UpdateTourPriceInput): Promise<TourPriceResponse> {
    const existingPrice = await tourPriceRepository.findById(id);
    if (!existingPrice) {
      throw new NotFoundError("TourPrice", id);
    }

    const updatedPrice = await tourPriceRepository.update(id, data);
    return toTourPriceResponse(updatedPrice);
  }

  /**
   * Elimina un precio
   */
  async delete(id: string): Promise<void> {
    const existingPrice = await tourPriceRepository.findById(id);
    if (!existingPrice) {
      throw new NotFoundError("TourPrice", id);
    }

    await tourPriceRepository.delete(id);
  }
}

