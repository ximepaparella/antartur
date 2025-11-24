/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Listar órdenes
 *     tags: [Orders]
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
 *           enum: [PENDING_PAYMENT, PAID, CANCELLED, EXPIRED, COMPLETED]
 *         description: Filtrar por estado
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [RESERVATION, ENQUIRY]
 *         description: Filtrar por tipo
 *     responses:
 *       200:
 *         description: Lista de órdenes
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
 *                     $ref: '#/components/schemas/Order'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *   post:
 *     summary: Crear orden/reserva
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderInput'
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 */

import { OrdersController } from "@/modules/orders/api/controllers/ordersController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse, createdResponse, paginatedResponse } from "@/lib/api/response";

const controller = new OrdersController();

export const GET = withRateLimitHandler("public", withControllerErrorHandler(async (request) => {
  const result = await controller.list(request);
  return paginatedResponse(result.data, result.meta);
}));

export const POST = withRateLimitHandler("write", withControllerErrorHandler(async (request) => {
  const body = await request.json();
  const order = await controller.create(body);
  return createdResponse(order);
}));

