/**
 * @swagger
 * /api/notifications/order/{orderId}:
 *   get:
 *     summary: Obtener notificaciones de una orden
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Lista de notificaciones de la orden
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

import { notificationsHandler } from "@/modules/notifications/api/handlers/notificationsHandler";

export const GET = notificationsHandler.getByOrderId;

