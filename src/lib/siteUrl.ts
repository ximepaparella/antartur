/**
 * URL canónica del sitio (SEO, sitemap, robots, preload).
 * Configurar NEXT_PUBLIC_SITE_URL en producción (sin barra final).
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "https://antartur.tur.ar";
  return raw.replace(/\/$/, "");
}
