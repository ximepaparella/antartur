/**
 * Formatea un precio en ARS
 * Formato: $1.500 (sin decimales)
 */
export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}
