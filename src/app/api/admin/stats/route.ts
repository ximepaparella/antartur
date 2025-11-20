/**
 * API Route: Estadísticas administrativas
 * GET /api/admin/stats - Obtener estadísticas generales
 */

import { adminHandler } from "@/modules/orders/api/handlers/adminHandler";

export const GET = adminHandler.getStats;

