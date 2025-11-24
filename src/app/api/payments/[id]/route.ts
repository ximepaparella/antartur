/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Obtener pago por ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pago
 *     responses:
 *       200:
 *         description: Pago encontrado
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
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     method:
 *                       type: string
 *                     status:
 *                       type: string
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { paymentsHandler } from "@/modules/payments/api/handlers/paymentsHandler";

export const GET = paymentsHandler.getById;

