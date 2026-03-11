export type HomePrimarySeason = "SUMMER" | "WINTER" | "AUTO";

export interface SiteSettings {
  id: string;
  homePrimarySeason: HomePrimarySeason;

  gtmId: string | null;
  ga4Id: string | null;

  phone: string | null;
  whatsappNumber: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;

  facebookUrl: string | null;
  instagramUrl: string | null;
  whatsappUrl: string | null;
}

export type UpdateSiteSettingsInput = Partial<
  Omit<SiteSettings, "id">
> & {
  id?: string;
};

