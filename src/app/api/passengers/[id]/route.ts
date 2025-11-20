/**
 * API Route: Passenger por ID
 * GET /api/passengers/:id - Obtener pasajero por ID
 */

import { passengersHandler } from "@/modules/passengers/api/handlers/passengersHandler";

export const GET = passengersHandler.getById;

