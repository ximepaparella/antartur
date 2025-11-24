/**
 * @swagger
 * /api/tours/{id}:
 *   get:
 *     summary: Obtener tour por ID
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
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
 *   put:
 *     summary: Actualizar tour
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
 *             $ref: '#/components/schemas/CreateTourInput'
 *     responses:
 *       200:
 *         description: Tour actualizado exitosamente
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
 *   delete:
 *     summary: Eliminar tour
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tour
 *     responses:
 *       204:
 *         description: Tour eliminado exitosamente
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

import { toursHandler } from "@/modules/tours/api/handlers/toursHandler";

export const GET = toursHandler.getById;
export const PUT = toursHandler.update;
export const DELETE = toursHandler.delete;

