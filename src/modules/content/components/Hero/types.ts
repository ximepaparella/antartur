/**
 * Tipos TypeScript estrictos para Hero data
 */

export interface HeroContent {
  /** Título principal del hero */
  title: string;
  /** Subtítulo opcional */
  subtitle?: string;
  /** URL de la imagen de fondo */
  backgroundImage: string;
  /** Posición de la imagen de fondo */
  backgroundPosition: string;
  /** Opacidad del overlay (0-1) */
  overlayOpacity: number;
}

/**
 * Estructura del archivo herodata.json
 */
export interface HeroData {
  [pageKey: string]: HeroContent;
}

/**
 * Valida que un objeto sea un HeroContent válido
 */
export function isValidHeroContent(data: unknown): data is HeroContent {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const hero = data as Record<string, unknown>;

  return (
    typeof hero.title === "string" &&
    hero.title.length > 0 &&
    (hero.subtitle === undefined || typeof hero.subtitle === "string") &&
    typeof hero.backgroundImage === "string" &&
    typeof hero.backgroundPosition === "string" &&
    typeof hero.overlayOpacity === "number" &&
    hero.overlayOpacity >= 0 &&
    hero.overlayOpacity <= 1
  );
}

