/**
 * Controller para Tours
 * Maneja la lógica de validación, transformación y llamadas a servicios
 */

import { NextRequest } from "next/server";
import { TourRepository } from "../../infra/tourRepository";
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
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { normalizePagination, calculatePaginationMeta } from "@/lib/api/response";
import { prisma } from "@/lib/db";

const tourRepository = new TourRepository();

export class ToursController {
  /**
   * Listar todos los tours con paginación y filtros
   */
  async list(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = validateQuery(listToursQuerySchema, Object.fromEntries(searchParams));

    const { page, limit, skip } = normalizePagination(query.page, query.limit);

    // Construir where clause para filtros
    const where: any = {};
    if (query.category) {
      where.category = query.category;
    }
    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { subtitle: { contains: query.search, mode: "insensitive" } },
        { shortDescription: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // Obtener tours con paginación
    const [tours, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        skip,
        take: limit,
        orderBy: query.sortBy
          ? { [query.sortBy]: query.sortOrder || "asc" }
          : { createdAt: "desc" },
        include: {
          images: true,
          prices: true,
        },
      }),
      prisma.tour.count({ where }),
    ]);

    const meta = calculatePaginationMeta(page, limit, total);
    const data = tours.map(toTourWithImagesResponse);

    return { data, meta };
  }

  /**
   * Obtener tour por ID
   */
  async getById(id: string, includeAvailability = false, includeContent = false) {
    const tour = await tourRepository.findById(id, true, includeAvailability, true, includeContent);

    if (!tour) {
      throw new NotFoundError("Tour", id);
    }

    if (includeAvailability || includeContent) {
      return toTourFullResponse(tour);
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
    const tour = await tourRepository.findBySlug(
      slug,
      includeImages,
      includeDepartures,
      includePrices,
      includeContent
    );

    if (!tour) {
      throw new NotFoundError("Tour", slug);
    }

    if (includeDepartures || includeContent) {
      return toTourFullResponse(tour);
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

    // Verificar que el slug no exista
    const existingTour = await tourRepository.findBySlug(data.slug);
    if (existingTour) {
      throw new ValidationError("Tour with this slug already exists", { slug: data.slug });
    }

    const tour = await tourRepository.create(data);
    
    // Obtener tour con precios para la respuesta
    const tourWithPrices = await tourRepository.findById(tour.id, false, false, true);
    return toTourResponse(tourWithPrices!);
  }

  /**
   * Actualizar tour existente
   */
  async update(id: string, body: unknown) {
    // Verificar que el tour existe
    const existingTour = await tourRepository.findById(id);
    if (!existingTour) {
      throw new NotFoundError("Tour", id);
    }

    const data = validateBody(updateTourSchema, body);

    // Si se actualiza el slug, verificar que no exista otro tour con ese slug
    if (data.slug && data.slug !== existingTour.slug) {
      const slugExists = await tourRepository.findBySlug(data.slug);
      if (slugExists) {
        throw new ValidationError("Tour with this slug already exists", { slug: data.slug });
      }
    }

    const updatedTour = await tourRepository.update(id, data);
    
    // Obtener tour con precios para la respuesta
    const tourWithPrices = await tourRepository.findById(updatedTour.id, false, false, true);
    return toTourResponse(tourWithPrices!);
  }

  /**
   * Eliminar tour
   */
  async delete(id: string) {
    const tour = await tourRepository.findById(id);
    if (!tour) {
      throw new NotFoundError("Tour", id);
    }

    await tourRepository.delete(id);
    return null;
  }
}

