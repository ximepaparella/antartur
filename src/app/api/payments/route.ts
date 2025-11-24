/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Crear registro de pago (admin)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, amount, currency, method]
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [ARS, USD]
 *               method:
 *                 type: string
 *                 enum: [PAYPAL, PAYWAY]
 *               transactionId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *     responses:
 *       201:
 *         description: Pago creado exitosamente
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

import { paymentsHandler } from "@/modules/payments/api/handlers/paymentsHandler";

export const POST = paymentsHandler.create;

