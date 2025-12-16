/**
 * @swagger
 * /api/tours:
 *   get:
 *     summary: Listar tours
 *     tags: [Tours]
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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *         description: Filtrar por dificultad
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en nombre, subtítulo o descripción
 *     responses:
 *       200:
 *         description: Lista de tours
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
 *                     $ref: '#/components/schemas/Tour'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *   post:
 *     summary: Crear un nuevo tour
 *     tags: [Tours]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTourInput'
 *     responses:
 *       201:
 *         description: Tour creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tour'
 */

import { ToursController } from "@/modules/tours/api/controllers/toursController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse, createdResponse, paginatedResponse } from "@/lib/api/response";
import { withAuth } from "@/lib/auth";

const controller = new ToursController();

// GET es público - permite ver tours sin autenticación
export const GET = withRateLimitHandler("read", withControllerErrorHandler(async (request, context) => {
  const result = await controller.list(request);
  return paginatedResponse(result.data, result.meta);
}));

// POST requiere autenticación de admin
export const POST = withAuth(
  withRateLimitHandler("write", withControllerErrorHandler(async (request, context) => {
    const body = await request.json();
    const tour = await controller.create(body);
    return createdResponse(tour);
  })),
  { roles: ["ADMIN"] }
);

