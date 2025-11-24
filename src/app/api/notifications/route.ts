/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Crear notificación
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, type, message]
 *             properties:
 *               orderId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [EMAIL, SMS, PUSH]
 *               message:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, SENT, FAILED]
 *     responses:
 *       201:
 *         description: Notificación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */

import { notificationsHandler } from "@/modules/notifications/api/handlers/notificationsHandler";

export const POST = notificationsHandler.create;

