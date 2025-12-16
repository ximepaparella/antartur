/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Listar bookings
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de items por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por estado
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         description: Filtrar por ID de orden
 *     responses:
 *       200:
 *         description: Lista de bookings
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
 *                     $ref: '#/components/schemas/Booking'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */

import { BookingsController } from "@/modules/booking/api/controllers/bookingsController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { paginatedResponse } from "@/lib/api/response";
import { withAuth } from "@/lib/auth";

const controller = new BookingsController();

// GET requiere autenticación de admin
export const GET = withAuth(
  withRateLimitHandler("admin", withControllerErrorHandler(async (request, context) => {
    const result = await controller.list(request);
    return paginatedResponse(result.data, result.meta);
  })),
  { roles: ["ADMIN"] }
);

