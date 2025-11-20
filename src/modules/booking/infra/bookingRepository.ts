/**
 * Repositorio para acceso a datos de Bookings usando Prisma
 */

import { PrismaClient, BookingStatus } from "@prisma/client";
import type { CreateBookingInput } from "../domain/types";

const prisma = new PrismaClient();

export class BookingRepository {
  async findAll(orderId?: string) {
    return prisma.booking.findMany({
      where: orderId ? { orderId } : undefined,
      include: {
        passengers: true,
      },
    });
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

