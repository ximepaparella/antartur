export type HomePrimarySeason = "SUMMER" | "WINTER" | "AUTO";

/** Antelación mínima en horas para permitir una reserva (24, 48 o 72). */
export type MinimumAdvanceBookingHours = 24 | 48 | 72;

export interface SiteSettings {
  id: string;
  homePrimarySeason: HomePrimarySeason;

  /** Antelación mínima en horas (24, 48, 72). null = sin restricción (por defecto 24). */
  minimumAdvanceBookingHours: MinimumAdvanceBookingHours | null;
  /** Habilita reservas con pago. Si es false, el checkout registra consultas. */
  onlineBookingsEnabled: boolean;

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

