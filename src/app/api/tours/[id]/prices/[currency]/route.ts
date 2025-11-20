/**
 * API Route: Precio de Tour por Moneda
 * GET /api/tours/:id/prices/:currency - Obtener precio específico por moneda
 */

import { tourPricesHandler } from "@/modules/tours/api/handlers/tourPricesHandler";

export const GET = tourPricesHandler.getByCurrency;

