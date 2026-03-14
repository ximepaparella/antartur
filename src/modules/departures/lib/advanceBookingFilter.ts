/**
 * Filtro de antelación mínima para reservas.
 * Usado por AvailabilityController y ToursController para no mostrar
 * fechas dentro del margen configurado (24, 48 o 72 hs).
 */

/** Fecha mínima (inicio del día UTC) a partir de la cual se permite reservar: now + hours. */
export function getMinimumBookableDate(hours: number): Date {
  const now = new Date();
  const cutoff = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth(), cutoff.getUTCDate()));
}

export function isDepartureBookableByAdvance(
  departure: { departureDate: Date },
  minimumBookableDate: Date
): boolean {
  const d = new Date(departure.departureDate);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime() >= minimumBookableDate.getTime();
}

export function filterDeparturesByAdvanceBooking<T extends { departureDate: Date }>(
  departures: T[],
  minimumAdvanceHours: number
): T[] {
  const minimumBookableDate = getMinimumBookableDate(minimumAdvanceHours);
  return departures.filter((d) => isDepartureBookableByAdvance(d, minimumBookableDate));
}
