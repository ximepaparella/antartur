/**
 * HTTP Handlers para Passengers
 * Maneja requests HTTP y delega a controllers
 */

import { NextRequest } from "next/server";
import { PassengersController } from "../controllers/passengersController";
import { successResponse } from "@/lib/api/response";
import { withErrorHandler } from "@/lib/api/errorHandler";

const controller = new PassengersController();

export const passengersHandler = {
  /**
   * GET /api/passengers/:id - Obtener pasajero por ID
   */
  getById: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const passenger = await controller.getById(id);
    return successResponse(passenger);
  }),

  /**
   * GET /api/bookings/:id/passengers - Obtener pasajeros de un booking
   */
  getByBookingId: withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const passengers = await controller.getByBookingId(id);
    return successResponse(passengers);
  }),
};

