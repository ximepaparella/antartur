/**
 * @swagger
 * /api/payments/webhook/payway:
 *   post:
 *     summary: Webhook de Payway para procesar notificaciones de pago
 *     tags: [Payments]
 *     description: Endpoint para recibir notificaciones de Payway sobre el estado de los pagos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload de notificación de Payway
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 */

import { paymentsHandler } from "@/modules/payments/api/handlers/paymentsHandler";

export const POST = paymentsHandler.paywayWebhook;

