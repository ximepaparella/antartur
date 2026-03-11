import { getSiteSettings } from "@/modules/settings/repository";

let cachedGtmId: string | null = null;
let cachedGa4Id: string | null = null;
let settingsLoaded = false;

async function ensureSettingsLoaded() {
  if (settingsLoaded) return;

  try {
    const settings = await getSiteSettings();
    cachedGtmId = settings.gtmId;
    cachedGa4Id = settings.ga4Id;
  } catch {
    // Ignorar errores: en el peor caso se usan solo las env vars
  } finally {
    settingsLoaded = true;
  }
}

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";

export async function getEffectiveGtmId(): Promise<string | null> {
  await ensureSettingsLoaded();

  if (cachedGtmId && cachedGtmId.trim() !== "") {
    return cachedGtmId;
  }

  return GTM_ID || null;
}

export async function getEffectiveGa4Id(): Promise<string | null> {
  await ensureSettingsLoaded();

  if (cachedGa4Id && cachedGa4Id.trim() !== "") {
    return cachedGa4Id;
  }

  return GA4_ID || null;
}

export const hasGtmId = (): boolean => Boolean(GTM_ID);

export const hasGa4Id = (): boolean => Boolean(GA4_ID);

