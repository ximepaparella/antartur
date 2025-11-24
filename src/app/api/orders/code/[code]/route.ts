/**
 * @swagger
 * /api/orders/code/{code}:
 *   get:
 *     summary: Obtener orden por codigo
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Codigo unico de la orden (ej. ORD-2024-001)
 *       - in: query
 *         name: includePayments
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir informacion de pagos
 *     responses:
 *       200:
 *         description: Orden encontrada
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

import { ordersHandler } from "@/modules/orders/api/handlers/ordersHandler";

export const GET = ordersHandler.getByCode;

