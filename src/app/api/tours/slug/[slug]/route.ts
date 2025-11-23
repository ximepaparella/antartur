/**
 * @swagger
 * /api/tours/slug/{slug}:
 *   get:
 *     summary: Obtener tour por slug
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug del tour (URL-friendly identifier)
 *       - in: query
 *         name: includeAvailability
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir disponibilidad del tour
 *     responses:
 *       200:
 *         description: Tour encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tour'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { toursHandler } from "@/modules/tours/api/handlers/toursHandler";

export const GET = toursHandler.getBySlug;

