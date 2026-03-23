/**
 * Date helpers normalized to Argentina timezone (GMT-3).
 */

const AR_TIMEZONE = "America/Argentina/Buenos_Aires";

type DateInput = Date | string | number;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Returns YYYY-MM-DD for date-only semantics without timezone shift.
 * For Date instances, it uses UTC components to preserve @db.Date values.
 */
export function toArDateKey(input: DateInput): string {
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  const date = input instanceof Date ? input : new Date(input);
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

/**
 * Formats a date in es-AR locale, always using Argentina timezone.
 */
export function formatArDate(
  input: DateInput,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: AR_TIMEZONE,
    ...options,
  }).format(date);
}

/**
 * Parses YYYY-MM-DD to a Date anchored at UTC midnight.
 * This avoids server-local timezone drift.
 */
export function parseDateKeyToLocalDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export { AR_TIMEZONE };
