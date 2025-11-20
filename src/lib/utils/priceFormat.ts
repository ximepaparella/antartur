/**
 * Formatea un precio según la moneda
 * ARS: $1.000 (sin decimales, con punto de miles)
 * USD: USD 100 (sin decimales, prefijo USD)
 * 
 * @param amount - Cantidad a formatear
 * @param currency - Código de moneda (ARS, USD, etc.)
 * @returns Precio formateado según la moneda
 */
export function formatPriceByCurrency(amount: number, currency: string = "ARS"): string {
  const formattedAmount = amount.toLocaleString("es-AR", { maximumFractionDigits: 0 });
  
  switch (currency.toUpperCase()) {
    case "USD":
      return `USD ${formattedAmount}`;
    case "ARS":
    default:
      return `$${formattedAmount}`;
  }
}

/**
 * Formatea un precio en ARS (compatibilidad hacia atrás)
 * Formato: $1.500 (sin decimales)
 * 
 * @deprecated Usar formatPriceByCurrency en su lugar
 */
export function formatPrice(amount: number): string {
  return formatPriceByCurrency(amount, "ARS");
}
