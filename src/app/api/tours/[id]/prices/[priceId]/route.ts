/**
 * API Route: Precio de Tour por ID
 * PUT /api/tours/:id/prices/:priceId - Actualizar precio
 * DELETE /api/tours/:id/prices/:priceId - Eliminar precio
 */

import { tourPricesHandler } from "@/modules/tours/api/handlers/tourPricesHandler";

export const PUT = tourPricesHandler.update;
export const DELETE = tourPricesHandler.remove;

