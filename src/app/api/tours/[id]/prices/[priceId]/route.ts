/**
 * @swagger
 * /api/tours/{id}/prices/{priceId}:
 *   put:
 *     summary: Actualizar precio de un tour
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *       - in: path
 *         name: priceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del precio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priceAdult:
 *                 type: number
 *               priceChild:
 *                 type: number
 *     responses:
 *       200:
 *         description: Precio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TourPrice'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Eliminar precio de un tour
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *       - in: path
 *         name: priceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del precio
 *     responses:
 *       204:
 *         description: Precio eliminado exitosamente
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { tourPricesHandler } from "@/modules/tours/api/handlers/tourPricesHandler";

export const PUT = tourPricesHandler.update;
export const DELETE = tourPricesHandler.remove;

