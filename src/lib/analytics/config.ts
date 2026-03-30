import { getSiteSettings } from "@/modules/settings/repository";
import type { SiteSettings } from "@/modules/settings/types";

export const GTM_ID = (process.env.NEXT_PUBLIC_GTM_ID ?? "").trim();

export const GA4_ID = (process.env.NEXT_PUBLIC_GA4_ID ?? "").trim();

export async function getEffectiveGtmId(siteSettings?: SiteSettings): Promise<string | null> {
  try {
    const settings = siteSettings ?? await getSiteSettings();
    const configured = settings.gtmId?.trim();
    if (configured) {
      return configured;
    }
  } catch {
    // Ignorar errores: en el peor caso se usa env.
  }

  return GTM_ID || null;
}

export async function getEffectiveGa4Id(siteSettings?: SiteSettings): Promise<string | null> {
  try {
    const settings = siteSettings ?? await getSiteSettings();
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

