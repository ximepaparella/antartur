/**
 * @swagger
 * /api/payments/webhook/paypal:
 *   post:
 *     summary: Webhook de PayPal para procesar notificaciones de pago
 *     tags: [Payments]
 *     description: Endpoint para recibir notificaciones de PayPal sobre el estado de los pagos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload de notificación de PayPal
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

export const POST = paymentsHandler.paypalWebhook;

