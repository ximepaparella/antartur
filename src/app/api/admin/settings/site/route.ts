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

const gtmIdSchema = z.string().regex(/^GTM-[A-Z0-9]+$/, "Formato GTM-XXXXXXX").max(100).optional().nullable();
const ga4IdSchema = z.string().regex(/^G-[A-Z0-9]+$/, "Formato G-XXXXXXXXXX").max(100).optional().nullable();

function httpOrHttpsUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const updateSiteSettingsSchema = z.object({
  homePrimarySeason: z.enum(["SUMMER", "WINTER", "AUTO"]).optional(),
  minimumAdvanceBookingHours: z.union([z.literal(24), z.literal(48), z.literal(72)]).nullable().optional(),
  gtmId: gtmIdSchema,
  ga4Id: ga4IdSchema,
  phone: z.string().max(100).optional().nullable(),
  whatsappNumber: z.string().max(100).optional().nullable(),
  email: z.string().email().max(200).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  facebookUrl: z.string().url().max(300).refine(httpOrHttpsUrl, "Solo http o https").optional().nullable(),
  instagramUrl: z.string().url().max(300).refine(httpOrHttpsUrl, "Solo http o https").optional().nullable(),
  whatsappUrl: z.string().url().max(300).refine(httpOrHttpsUrl, "Solo http o https").optional().nullable(),
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

