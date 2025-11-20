/**
 * Controller para Availability (TourDepartures)
 * Maneja la lógica de validación, transformación y llamadas a servicios
 */

import { NextRequest } from "next/server";
import { DepartureRepository } from "../../infra/departureRepository";
import { TourRepository } from "../../../tours/infra/tourRepository";
import { validateQuery, validateBody } from "@/lib/validation/schemas";
import {
  createAvailabilitySchema,
  updateAvailabilitySchema,
  tourAvailabilityQuerySchema,
  type CreateAvailabilityInput,
  type UpdateAvailabilityInput,
  type TourAvailabilityQuery,
} from "../validators/availabilityValidators";
import {
  toAvailabilityResponse,
  toAvailabilityDetailResponse,
  type AvailabilityResponse,
  type AvailabilityDetailResponse,
} from "../dto/availabilityDto";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { prisma } from "@/lib/db";

const departureRepository = new DepartureRepository();
const tourRepository = new TourRepository();

export class AvailabilityController {
  /**
   * Obtener disponibilidad de un tour
   */
  async getByTourId(tourId: string, query: TourAvailabilityQuery) {
    // Verificar que el tour existe
    const tour = await tourRepository.findById(tourId);
    if (!tour) {
      throw new NotFoundError("Tour", tourId);
    }

    // Construir where clause
    const where: any = { tourId };
    if (query.date) {
      where.departureDate = new Date(query.date);
    }
    if (query.startDate && query.endDate) {
      where.departureDate = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    } else if (query.startDate) {
      where.departureDate = { gte: new Date(query.startDate) };
    } else if (query.endDate) {
      where.departureDate = { lte: new Date(query.endDate) };
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const departures = await prisma.tourDeparture.findMany({
      where,
      orderBy: {
        departureDate: "asc",
      },
    });

    return departures.map(toAvailabilityResponse);
  }

  /**
   * Obtener disponibilidad para una fecha específica
   */
  async getByTourIdAndDate(tourId: string, date: string) {
    // Verificar que el tour existe
    const tour = await tourRepository.findById(tourId);
    if (!tour) {
      throw new NotFoundError("Tour", tourId);
    }

    const departures = await prisma.tourDeparture.findMany({
      where: {
        tourId,
        departureDate: new Date(date),
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return departures.map(toAvailabilityResponse);
  }

  /**
   * Obtener availability por ID
   */
  async getById(id: string) {
    const departure = await departureRepository.findById(id);
    if (!departure) {
      throw new NotFoundError("Availability", id);
    }

    return toAvailabilityDetailResponse(departure);
  }

  /**
   * Crear nueva availability
   */
  async create(body: unknown) {
    const data = validateBody(createAvailabilitySchema, body);

    // Verificar que el tour existe
    const tour = await tourRepository.findById(data.tourId);
    if (!tour) {
      throw new NotFoundError("Tour", data.tourId);
    }

    // Verificar que no exista ya un departure con la misma fecha y hora
    const existing = await prisma.tourDeparture.findFirst({
      where: {
        tourId: data.tourId,
        departureDate: new Date(data.departureDate),
        startTime: data.startTime,
      },
    });

    if (existing) {
      throw new ValidationError("Availability already exists for this tour, date and time", {
        tourId: data.tourId,
        date: data.departureDate,
        startTime: data.startTime,
      });
    }

    const departure = await departureRepository.create({
      ...data,
      departureDate: new Date(data.departureDate),
    });

    return toAvailabilityDetailResponse(departure);
  }

  /**
   * Actualizar availability
   */
  async update(id: string, body: unknown) {
    const departure = await departureRepository.findById(id);
    if (!departure) {
      throw new NotFoundError("Availability", id);
    }

    const data = validateBody(updateAvailabilitySchema, body);

    // Si se actualiza tourId, verificar que existe
    if (data.tourId && data.tourId !== departure.tourId) {
      const tour = await tourRepository.findById(data.tourId);
      if (!tour) {
        throw new NotFoundError("Tour", data.tourId);
      }
    }

    // Si se actualiza fecha/hora, verificar que no haya conflicto
    if (data.departureDate || data.startTime) {
      const checkDate = data.departureDate ? new Date(data.departureDate) : departure.departureDate;
      const checkTime = data.startTime || departure.startTime;
      const checkTourId = data.tourId || departure.tourId;

      const existing = await prisma.tourDeparture.findFirst({
        where: {
          tourId: checkTourId,
          departureDate: checkDate,
          startTime: checkTime,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ValidationError("Availability already exists for this tour, date and time");
      }
    }

    const updated = await departureRepository.update(id, {
      ...data,
      departureDate: data.departureDate ? new Date(data.departureDate) : undefined,
    });

    return toAvailabilityDetailResponse(updated);
  }

  /**
   * Eliminar availability
   */
  async delete(id: string) {
    const departure = await departureRepository.findById(id);
    if (!departure) {
      throw new NotFoundError("Availability", id);
    }

    await departureRepository.delete(id);
    return null;
  }
}

