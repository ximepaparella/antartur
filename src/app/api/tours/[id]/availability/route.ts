/**
 * @swagger
 * /api/tours/{id}/availability:
 *   get:
 *     summary: Obtener disponibilidad de un tour
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *       - in: query
 *         name: availableOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Solo mostrar fechas con disponibilidad
 *     responses:
 *       200:
 *         description: Lista de disponibilidad del tour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Availability'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   post:
 *     summary: Crear disponibilidad para un tour
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, startTime, available]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 example: "13:00"
 *               available:
 *                 type: number
 *               seatsTotal:
 *                 type: number
 *     responses:
 *       201:
 *         description: Disponibilidad creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Availability'
 */

import { AvailabilityController } from "@/modules/departures/api/controllers/availabilityController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse, createdResponse } from "@/lib/api/response";
import { validateQuery } from "@/lib/validation/schemas";
import { tourAvailabilityQuerySchema } from "@/modules/departures/api/validators/availabilityValidators";
import { withAuth } from "@/lib/auth";
import { getAuthUser } from "@/lib/auth";

const controller = new AvailabilityController();

// GET es público - permite consultar disponibilidad sin autenticación
export const GET = withRateLimitHandler("public", withControllerErrorHandler(async (request, context) => {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const query = validateQuery(tourAvailabilityQuerySchema, Object.fromEntries(searchParams));
  const authUser = await getAuthUser(request);
  const includeUnbookable = authUser?.role === "ADMIN";

  const availability = await controller.getByTourId(id, query, { includeUnbookable });
  return successResponse(availability);
}));

// POST requiere autenticación de admin
// Usar rate limit "admin" en lugar de "write" para operaciones bulk de admin
export const POST = withAuth(
  withRateLimitHandler("admin", withControllerErrorHandler(async (request, context) => {
    const { id } = await context.params;
    const body = await request.json();
    // Convertir 'date' a 'departureDate' si viene como 'date' (compatibilidad con frontend)
    const data = { 
      ...body, 
      tourId: id,
      departureDate: body.departureDate || body.date,
    };
    // Eliminar 'date' si existe para evitar conflictos
    if (data.date) {
      delete (data as any).date;
    }

    const availability = await controller.create(data);
    return createdResponse(availability);
  })),
  { roles: ["ADMIN"] }
);

