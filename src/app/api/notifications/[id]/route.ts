/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Obtener notificación por ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     orderId:
 *                       type: string
 *                     type:
 *                       type: string
 *                     message:
 *                       type: string
 *                     status:
 *                       type: string
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { notificationsHandler } from "@/modules/notifications/api/handlers/notificationsHandler";

export const GET = notificationsHandler.getById;

