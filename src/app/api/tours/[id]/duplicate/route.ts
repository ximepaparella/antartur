import { ToursController } from "@/modules/tours/api/controllers/toursController";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { successResponse } from "@/lib/api/response";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { withAuth } from "@/lib/auth";

const controller = new ToursController();

// POST requiere autenticación de admin
export const POST = withAuth(
  withRateLimitHandler("write", withControllerErrorHandler(async (request, context) => {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const tour = await controller.duplicate(id, body);
    return successResponse(tour);
  })),
  { roles: ["ADMIN"] }
);

