/**
 * API Route: Precios de Tour
 * GET /api/tours/:id/prices - Listar precios de un tour
 * GET /api/tours/:id/prices?currency=ARS - Obtener precio específico por moneda
 * POST /api/tours/:id/prices - Crear precio para un tour
 */

import { tourPricesHandler } from "@/modules/tours/api/handlers/tourPricesHandler";

export const GET = tourPricesHandler.list;
export const POST = tourPricesHandler.create;

