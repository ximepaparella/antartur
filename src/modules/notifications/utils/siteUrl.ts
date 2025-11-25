/**
 * Utilidad para obtener la URL base del sitio
 * Separada de emailService para evitar importar nodemailer en el cliente
 */

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://antartur.tur.ar";
}

