/**
 * @swagger
 * /api/bookings/order/{orderId}:
 *   get:
 *     summary: Obtener bookings de una orden
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *       - in: query
 *         name: includePassengers
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir información de pasajeros
 *     responses:
 *       200:
 *         description: Lista de bookings de la orden
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

import { bookingsHandler } from "@/modules/booking/api/handlers/bookingsHandler";

export const GET = bookingsHandler.getByOrderId;

