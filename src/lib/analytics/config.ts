import { getSiteSettings } from "@/modules/settings/repository";

const DEFAULT_GTM_ID = "GTM-KZR649ZB";
export const GTM_ID = (process.env.NEXT_PUBLIC_GTM_ID ?? DEFAULT_GTM_ID).trim();

export const GA4_ID = (process.env.NEXT_PUBLIC_GA4_ID ?? "").trim();

export async function getEffectiveGtmId(): Promise<string | null> {
  try {
    const settings = await getSiteSettings();
    const configured = settings.gtmId?.trim();
    if (configured) {
      return configured;
    }
  } catch {
    // Ignorar errores: en el peor caso se usa env/default.
  }

  return GTM_ID || null;
}

export async function getEffectiveGa4Id(): Promise<string | null> {
  try {
    const settings = await getSiteSettings();
    const configured = settings.ga4Id?.trim();
    if (configured) {
      return configured;
    }
  } catch {
    // Ignorar errores: en el peor caso se usa env.
  }

  return GA4_ID || null;
}

export const hasGtmId = (): boolean => Boolean(GTM_ID);

export const hasGa4Id = (): boolean => Boolean(GA4_ID);

