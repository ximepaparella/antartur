/**
 * Repositorio para acceso a datos de Bookings usando Prisma
 */

import { BookingStatus } from "@prisma/client";
import type { CreateBookingInput } from "../domain/types";
import { prisma } from "@/lib/db";

export class BookingRepository {
  async findAll(orderId?: string, status?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    
    if (orderId) {
      where.orderId = orderId;
    }
    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          passengers: true,
          order: {
            select: {
              id: true,
              code: true,
            },
          },
          tourDeparture: {
            include: {
              tour: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return { data: bookings, total, page, limit };
  }

  async findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        passengers: true,
        tourDeparture: true,
        order: true,
      },
    });
  }

  async create(data: CreateBookingInput) {
    return prisma.booking.create({
      data: {
        orderId: data.orderId,
        tourDepartureId: data.tourDepartureId,
        status: "HELD",
        numAdults: data.numAdults,
        numChildren: data.numChildren,
        totalSeats: data.totalSeats,
        unitPriceAdult: data.unitPriceAdult,
        unitPriceChild: data.unitPriceChild,
        currency: data.currency,
        tourNameSnapshot: data.tourNameSnapshot,
        departureDateSnapshot: data.departureDateSnapshot,
        startTimeSnapshot: data.startTimeSnapshot,
        meetingPointSnapshot: data.meetingPointSnapshot || null,
      },
    });
  }

  async updateStatus(id: string, status: BookingStatus) {
    return prisma.booking.update({
      where: { id },
      data: { status },
    });
  }
}

