/**
 * API Route: Tour por slug
 * GET /api/tours/slug/:slug - Obtener tour por slug
 */

import { toursHandler } from "@/modules/tours/api/handlers/toursHandler";

export const GET = toursHandler.getBySlug;

