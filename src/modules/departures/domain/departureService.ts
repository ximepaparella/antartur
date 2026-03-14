/**
 * Servicio de dominio para Departures (Availability)
 * Contiene la lógica de negocio para disponibilidad de tours
 */

import { DepartureRepository } from "../infra/departureRepository";
import { TourRepository } from "../../tours/infra/tourRepository";
import { NotFoundError, ValidationError } from "@/lib/api/errorHandler";
import { prisma } from "@/lib/db";
import type { CreateAvailabilityInput, UpdateAvailabilityInput, TourAvailabilityQuery } from "../api/validators/availabilityValidators";

const departureRepository = new DepartureRepository();
const tourRepository = new TourRepository();

export class DepartureService {
  /**
   * Obtener disponibilidad de un tour
   */
  async getAvailabilityByTourId(tourId: string, query: TourAvailabilityQuery) {
    // Validación de negocio: verificar que el tour existe
    const tour = await tourRepository.findById(tourId);
    if (!tour) {
      throw new NotFoundError("Tour", tourId);
    }

    // Construir where clause
    const where: Record<string, unknown> = { tourId };
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

    return departures;
  }

  /**
   * Obtener disponibilidad para una fecha específica
   */
  async getAvailabilityByTourIdAndDate(tourId: string, date: string) {
    // Validación de negocio: verificar que el tour existe
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
        departureDate: "asc",
      },
    });

    return departures;
  }

  /**
   * Obtener availability por ID
   */
  async getAvailabilityById(id: string) {
    const departure = await departureRepository.findById(id);
    if (!departure) {
      throw new NotFoundError("Availability", id);
    }
    return departure;
  }

  /**
   * Crear nueva availability
   */
  async createAvailability(data: CreateAvailabilityInput) {
    // Validación de negocio: verificar que el tour existe
    const tour = await tourRepository.findById(data.tourId);
    if (!tour) {
      throw new NotFoundError("Tour", data.tourId);
    }

    // Validación de negocio: verificar que no exista ya un departure para esa fecha (un solo horario por tour)
    const existing = await prisma.tourDeparture.findFirst({
      where: {
        tourId: data.tourId,
        departureDate: new Date(data.departureDate),
      },
    });

    if (existing) {
      throw new ValidationError("Availability already exists for this tour and date", {
        tourId: data.tourId,
        date: data.departureDate,
      });
    }

    try {
      const departure = await departureRepository.create({
        tourId: data.tourId,
        departureDate: new Date(data.departureDate),
        seatsTotal: data.seatsTotal,
        isActive: data.isActive ?? true,
      });
      return departure;
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : undefined;
      if (code === "P2002") {
        throw new ValidationError("Availability already exists for this tour and date", {
          tourId: data.tourId,
          date: data.departureDate,
        });
      }
      throw err;
    }
  }

  /**
   * Actualizar availability
   */
  async updateAvailability(id: string, data: UpdateAvailabilityInput) {
    const departure = await departureRepository.findById(id);
    if (!departure) {
      throw new NotFoundError("Availability", id);
    }

    // Validación de negocio: si se actualiza tourId, verificar que existe
    if (data.tourId && data.tourId !== departure.tourId) {
      const tour = await tourRepository.findById(data.tourId);
      if (!tour) {
        throw new NotFoundError("Tour", data.tourId);
      }
    }

    // Validación de negocio: si se actualiza fecha o tour, verificar que no haya conflicto
    if (data.departureDate != null || data.tourId != null) {
      const checkDate = data.departureDate != null ? new Date(data.departureDate) : departure.departureDate;
      const checkTourId = data.tourId ?? departure.tourId;

      const existing = await prisma.tourDeparture.findFirst({
        where: {
          tourId: checkTourId,
          departureDate: checkDate,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ValidationError("Availability already exists for this tour and date");
      }
    }

    const updated = await departureRepository.update(id, {
      ...data,
      departureDate: data.departureDate ? new Date(data.departureDate) : undefined,
    });

    return updated;
  }

  /**
   * Eliminar availability
   */
  async deleteAvailability(id: string) {
    const departure = await departureRepository.findById(id);
    if (!departure) {
      throw new NotFoundError("Availability", id);
    }

    // Validaciones de negocio: verificar dependencias antes de eliminar
    // (esto se puede expandir en el futuro para verificar bookings, etc.)

    await departureRepository.delete(id);
  }
}

