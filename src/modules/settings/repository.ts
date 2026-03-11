import { prisma } from "@/lib/db";
import type { SiteSettings, UpdateSiteSettingsInput } from "./types";

const SETTINGS_ID = "global";

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: SETTINGS_ID,
  homePrimarySeason: "SUMMER",
  gtmId: null,
  ga4Id: null,
  phone: null,
  whatsappNumber: null,
  email: null,
  address: null,
  city: null,
  country: null,
  facebookUrl: null,
  instagramUrl: null,
  whatsappUrl: null,
};

function normalize(raw: any): SiteSettings {
  if (!raw) {
    return DEFAULT_SITE_SETTINGS;
  }

  return {
    ...DEFAULT_SITE_SETTINGS,
    ...raw,
    id: raw.id ?? SETTINGS_ID,
    homePrimarySeason: raw.homePrimarySeason ?? "SUMMER",
  };
}

function sanitizeInput(input: UpdateSiteSettingsInput): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  (Object.keys(input) as (keyof UpdateSiteSettingsInput)[]).forEach((key) => {
    const value = input[key];
    if (typeof value !== "undefined") {
      data[key] = value;
    }
  });

  // Nunca permitir cambiar el id desde la API
  delete data.id;

  return data;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const existing = await (prisma as any).siteSettings.findUnique({
      where: { id: SETTINGS_ID },
    });

    if (!existing) {
      const created = await (prisma as any).siteSettings.create({
        data: { id: SETTINGS_ID },
      });
      return normalize(created);
    }

    return normalize(existing);
  } catch {
    // Si la base no está disponible (por ejemplo durante el build de Docker),
    // devolvemos settings por defecto para no romper el build.
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function updateSiteSettings(
  input: UpdateSiteSettingsInput
): Promise<SiteSettings> {
  const data = sanitizeInput(input);

  const updated = await (prisma as any).siteSettings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: {
      id: SETTINGS_ID,
      ...data,
    },
  });

  return normalize(updated);
}

