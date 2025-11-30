/**
 * Servicio de dominio para Tours
 * Contiene toda la lógica de negocio para tours
 */

import { TourRepository } from "../infra/tourRepository";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { normalizePagination, calculatePaginationMeta } from "@/lib/api/response";
import { prisma } from "@/lib/db";
import type { ListToursQuery, CreateTourInput, UpdateTourInput } from "../api/validators/toursValidators";

const tourRepository = new TourRepository();

export class TourService {
  /**
   * Listar tours con filtros y paginación
   */
  async listTours(query: ListToursQuery) {
    const { page, limit, skip } = normalizePagination(query.page, query.limit);

    // Construir where clause para filtros
    const where: Record<string, unknown> = {};
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
          additionals: {
            where: { isActive: true },
            include: {
              prices: true,
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      }),
      prisma.tour.count({ where }),
    ]);

    const meta = calculatePaginationMeta(page, limit, total);
    return { data: tours, meta };
  }

  /**
   * Obtener tour por ID
   */
  async getTourById(id: string, includeAvailability = false, includeContent = false) {
    const tour = await tourRepository.findById(id, true, includeAvailability, true, true, includeContent);

    if (!tour) {
      throw new NotFoundError("Tour", id);
    }

    return tour;
  }

  /**
   * Obtener tour por slug
   */
  async getTourBySlug(
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
      true, // includeAdditionals
      includeContent
    );

    if (!tour) {
      throw new NotFoundError("Tour", slug);
    }

    return tour;
  }

  /**
   * Crear nuevo tour
   */
  async createTour(data: CreateTourInput) {
    // Validación de negocio: verificar que el slug no exista
    const existingTour = await tourRepository.findBySlug(data.slug);
    if (existingTour) {
      throw new ValidationError("Tour with this slug already exists", { slug: data.slug });
    }

    const tour = await tourRepository.create(data);
    
    // Obtener tour completo con precios para la respuesta
    const tourWithPrices = await tourRepository.findById(tour.id, false, false, true);
    if (!tourWithPrices) {
      throw new NotFoundError("Tour", tour.id);
    }
    
    return tourWithPrices;
  }

  /**
   * Actualizar tour existente
   */
  async updateTour(id: string, data: UpdateTourInput) {
    // Verificar que el tour existe
    const existingTour = await tourRepository.findById(id);
    if (!existingTour) {
      throw new NotFoundError("Tour", id);
    }

    // Validación de negocio: si se actualiza el slug, verificar que no exista otro tour con ese slug
    if (data.slug && data.slug !== existingTour.slug) {
      const slugExists = await tourRepository.findBySlug(data.slug);
      if (slugExists) {
        throw new ValidationError("Tour with this slug already exists", { slug: data.slug });
      }
    }

    const updatedTour = await tourRepository.update(id, data);
    
    // Obtener tour completo con precios para la respuesta
    const tourWithPrices = await tourRepository.findById(updatedTour.id, false, false, true);
    if (!tourWithPrices) {
      throw new NotFoundError("Tour", updatedTour.id);
    }
    
    return tourWithPrices;
  }

  /**
   * Eliminar tour
   */
  async deleteTour(id: string) {
    const tour = await tourRepository.findById(id);
    if (!tour) {
      throw new NotFoundError("Tour", id);
    }

    // Validaciones de negocio: verificar dependencias antes de eliminar
    // (esto se puede expandir en el futuro para verificar bookings, etc.)
    
    await tourRepository.delete(id);
  }
}

