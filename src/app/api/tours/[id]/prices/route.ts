/**
 * @swagger
 * /api/tours/{id}/prices:
 *   get:
 *     summary: Listar precios de un tour
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           enum: [ARS, USD]
 *         description: Filtrar por moneda específica (opcional)
 *     responses:
 *       200:
 *         description: Lista de precios del tour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   oneOf:
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/TourPrice'
 *                     - $ref: '#/components/schemas/TourPrice'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   post:
 *     summary: Crear precio para un tour
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTourPriceInput'
 *     responses:
 *       201:
 *         description: Precio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TourPrice'
 */

import { tourPricesHandler } from "@/modules/tours/api/handlers/tourPricesHandler";

export const GET = tourPricesHandler.list;
export const POST = tourPricesHandler.create;

