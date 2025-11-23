/**
 * @swagger
 * /api/payments/order/{orderId}:
 *   get:
 *     summary: Obtener pagos de una orden
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Lista de pagos de la orden
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
 *                     type: object
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { paymentsHandler } from "@/modules/payments/api/handlers/paymentsHandler";

export const GET = paymentsHandler.getByOrderId;

