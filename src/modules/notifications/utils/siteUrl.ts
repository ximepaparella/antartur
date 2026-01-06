/**
 * Utilidad para obtener la URL base del sitio
 * Separada de emailService para evitar importar nodemailer en el cliente
 */

export function getSiteUrl(): string {
  // Usar SITE_URL (servidor) o NEXT_PUBLIC_SITE_URL (cliente), con fallback a URL de producción actual
  return process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://coderoots.tech";
}

