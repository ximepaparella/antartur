/**
 * @swagger
 * /api/tours/{id}/availability/{date}:
 *   get:
 *     summary: Obtener disponibilidad para fecha específica
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha en formato YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Disponibilidad para la fecha especificada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Availability'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { availabilityHandler } from "@/modules/departures/api/handlers/availabilityHandler";

export const GET = availabilityHandler.getByTourIdAndDate;

