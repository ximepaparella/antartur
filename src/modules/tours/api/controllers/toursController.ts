/**
 * Controller para Tours
 * Solo orquesta: valida entrada, llama servicios, transforma salida
 */

import { NextRequest } from "next/server";
import { TourService } from "../../domain/tourService";
import { validateQuery, validateBody } from "@/lib/validation/schemas";
import {
  createTourSchema,
  updateTourSchema,
  listToursQuerySchema,
  tourIdParamsSchema,
  tourSlugParamsSchema,
  type CreateTourInput,
  type UpdateTourInput,
  type ListToursQuery,
} from "../validators/toursValidators";
import {
  toTourResponse,
  toTourWithImagesResponse,
  toTourFullResponse,
  type TourResponse,
  type TourWithImagesResponse,
  type TourFullResponse,
} from "../dto/toursDto";
import { getSiteSettings } from "@/modules/settings/repository";
import { filterDeparturesByAdvanceBooking } from "@/modules/departures/lib/advanceBookingFilter";

const tourService = new TourService();

export class ToursController {
  /**
   * Listar todos los tours con paginación y filtros
   */
  async list(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = validateQuery(listToursQuerySchema, Object.fromEntries(searchParams));

    const result = await tourService.listTours(query);
    const data = result.data.map(toTourWithImagesResponse);

    return { data, meta: result.meta };
  }

  /**
   * Obtener tour por ID
   */
  async getById(id: string, includeAvailability = false, includeContent = false) {
    const tour = await tourService.getTourById(id, includeAvailability, includeContent);

    if (includeAvailability || includeContent) {
      const settings = await getSiteSettings();
      const hours = settings.minimumAdvanceBookingHours ?? 24;
      const departures = tour.departures ? filterDeparturesByAdvanceBooking(tour.departures, hours) : [];
      return toTourFullResponse({ ...tour, departures });
    }

    return toTourWithImagesResponse(tour);
  }

  /**
   * Obtener tour por slug
   */
  async getBySlug(
    slug: string,
    includeImages = true,
    includeDepartures = false,
    includePrices = true,
    includeContent = false
  ) {
    const tour = await tourService.getTourBySlug(
      slug,
      includeImages,
      includeDepartures,
      includePrices,
      includeContent
    );

    if (includeDepartures || includeContent) {
      const settings = await getSiteSettings();
      const hours = settings.minimumAdvanceBookingHours ?? 24;
      const departures = tour.departures ? filterDeparturesByAdvanceBooking(tour.departures, hours) : [];
      return toTourFullResponse({ ...tour, departures });
    }

    if (includeImages) {
      return toTourWithImagesResponse(tour);
    }

    return toTourResponse(tour);
  }

  /**
   * Crear nuevo tour
   */
  async create(body: unknown) {
    const data = validateBody(createTourSchema, body);
    const tour = await tourService.createTour(data);
    return toTourResponse(tour);
  }

  /**
   * Actualizar tour existente
   */
  async update(id: string, body: unknown) {
    const data = validateBody(updateTourSchema, body);
    const tour = await tourService.updateTour(id, data);
    return toTourResponse(tour);
  }

  /**
   * Eliminar tour
   */
  async delete(id: string) {
    await tourService.deleteTour(id);
    return null;
  }
}

