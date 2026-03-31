/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Actualizar estado de orden
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING_PAYMENT, PAID, CANCELLED, EXPIRED, COMPLETED]
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { OrdersController } from "@/modules/orders/api/controllers/ordersController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";
import { withAuth } from "@/lib/auth";

const controller = new OrdersController();

const updateOrderStatusHandler = withAuth(
  withRateLimitHandler("write", withControllerErrorHandler(async (request, context) => {
    const { id } = await context.params;
    const body = await request.json();

    const order = await controller.updateStatus(id, body);
    return successResponse(order);
  })),
  { roles: ["ADMIN"] }
);

// PUT requiere autenticación de admin
export const PUT = updateOrderStatusHandler;

// PATCH alias para compatibilidad con clientes existentes del dashboard
export const PATCH = updateOrderStatusHandler;

