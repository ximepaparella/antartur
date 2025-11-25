/**
 * Controller para TourPrices
 * Solo orquesta: valida entrada, llama servicios, transforma salida
 */

import { TourPriceService } from "../../domain/tourPriceService";
import {
  toTourPriceResponse,
  type TourPriceResponse,
} from "../dto/tourPriceDto";
import {
  CreateTourPriceInput,
  UpdateTourPriceInput,
} from "../validators/tourPricesValidators";

const tourPriceService = new TourPriceService();

export class TourPricesController {
  /**
   * Lista todos los precios de un tour
   */
  async listByTourId(tourId: string): Promise<TourPriceResponse[]> {
    const prices = await tourPriceService.listPricesByTourId(tourId);
    return prices.map(toTourPriceResponse);
  }

  /**
   * Obtiene un precio específico por tour y moneda
   */
  async getByTourIdAndCurrency(tourId: string, currency: string): Promise<TourPriceResponse> {
    const price = await tourPriceService.getPriceByTourIdAndCurrency(tourId, currency);
    return toTourPriceResponse(price);
  }

  /**
   * Crea un nuevo precio para un tour
   */
  async create(data: CreateTourPriceInput): Promise<TourPriceResponse> {
    const newPrice = await tourPriceService.createPrice(data);
    return toTourPriceResponse(newPrice);
  }

  /**
   * Actualiza un precio existente
   */
  async update(id: string, data: UpdateTourPriceInput): Promise<TourPriceResponse> {
    const updatedPrice = await tourPriceService.updatePrice(id, data);
    return toTourPriceResponse(updatedPrice);
  }

  /**
   * Elimina un precio
   */
  async delete(id: string): Promise<void> {
    await tourPriceService.deletePrice(id);
  }
}

