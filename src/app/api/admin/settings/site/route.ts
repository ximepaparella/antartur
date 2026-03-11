/**
 * Admin API para configuración general del sitio (SiteSettings)
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import { withControllerErrorHandler } from "@/lib/api/controllerWrapper";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";
import { successResponse } from "@/lib/api/response";
import { getSiteSettings, updateSiteSettings } from "@/modules/settings/repository";

const updateSiteSettingsSchema = z.object({
  homePrimarySeason: z.enum(["SUMMER", "WINTER", "AUTO"]).optional(),
  gtmId: z.string().max(100).optional(),
  ga4Id: z.string().max(100).optional(),
  phone: z.string().max(100).optional(),
  whatsappNumber: z.string().max(100).optional(),
  email: z.string().email().max(200).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  facebookUrl: z.string().url().max(300).optional(),
  instagramUrl: z.string().url().max(300).optional(),
  whatsappUrl: z.string().url().max(300).optional(),
});

function normalizeBody(body: unknown) {
  if (!body || typeof body !== "object") return {};

  return Object.fromEntries(
    Object.entries(body as Record<string, unknown>).map(([key, value]) => [
      key,
      typeof value === "string" && value.trim() === "" ? undefined : value,
    ])
  );
}

export const GET = withAuth(
  withRateLimitHandler(
    "admin",
    withControllerErrorHandler(async (_request: NextRequest) => {
      const settings = await getSiteSettings();
      return successResponse(settings);
    })
  ),
  { roles: ["ADMIN"] }
);

export const PATCH = withAuth(
  withRateLimitHandler(
    "admin",
    withControllerErrorHandler(async (request: NextRequest) => {
      const rawBody = await request.json();
      const cleanedBody = normalizeBody(rawBody);
      const validated = updateSiteSettingsSchema.parse(cleanedBody);

      const updated = await updateSiteSettings(validated);
      return successResponse(updated);
    })
  ),
  { roles: ["ADMIN"] }
);

